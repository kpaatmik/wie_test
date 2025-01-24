from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.db import transaction
from django.db.models import Avg
from django.utils import timezone
from django.db import models

from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience
from booking.models import Appointment
from .serializers import (
    UserSerializer, PregnantWomanSerializer, CaregiverSerializer,
    CaregiverReviewSerializer, CaregiverExperienceSerializer,
    UserRegistrationSerializer
)
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Create profile based on user type
            if user.user_type == 'pregnant':
                PregnantWoman.objects.create(
                    user=user,
                    pregnancy_week=1  # Set a default value
                )
            elif user.user_type == 'caregiver':
                caregiver_data = {
                    'user': user,
                    'bio': serializer.validated_data.get('bio', ''),
                    'hourly_rate': serializer.validated_data.get('hourly_rate', 0),
                }
                experience_years = serializer.validated_data.get('experience_years')
                if experience_years is not None:
                    caregiver_data['experience_years'] = experience_years
                
                Caregiver.objects.create(**caregiver_data)
            
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            return Response({
                'message': 'Registration failed',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': 'Registration failed',
                'errors': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CaregiverViewSet(viewsets.ModelViewSet):
    queryset = Caregiver.objects.all()
    serializer_class = CaregiverSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__city', 'user__state', 'specializations']
    ordering_fields = ['rating', 'hourly_rate', 'experience_years']

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            caregiver = Caregiver.objects.get(user=request.user)
            serializer = self.get_serializer(caregiver)
            return Response(serializer.data)
        except Caregiver.DoesNotExist:
            return Response(
                {"error": "Caregiver profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        caregiver = self.get_object()
        
        # Check if user is pregnant
        if not hasattr(request.user, 'pregnant_profile'):
            return Response(
                {'error': 'Only pregnant users can submit reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if rating is provided
        if 'rating' not in request.data:
            return Response(
                {'error': 'Rating is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create or update review
        review_data = {
            'caregiver': caregiver,
            'reviewer': request.user.pregnant_profile,
            'rating': request.data['rating'],
            'comment': request.data.get('comment', '')
        }
        
        review, created = CaregiverReview.objects.update_or_create(
            caregiver=caregiver,
            reviewer=request.user.pregnant_profile,
            defaults={'rating': request.data['rating'], 'comment': request.data.get('comment', '')}
        )
        
        # Update caregiver's average rating
        avg_rating = CaregiverReview.objects.filter(caregiver=caregiver).aggregate(Avg('rating'))['rating__avg']
        total_reviews = CaregiverReview.objects.filter(caregiver=caregiver).count()
        
        caregiver.rating = avg_rating or 0
        caregiver.total_reviews = total_reviews
        caregiver.save()
        
        serializer = CaregiverReviewSerializer(review)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        caregiver = self.get_object()
        return Response({
            'is_available': caregiver.is_available,
            'hourly_rate': caregiver.hourly_rate,
            'schedule': {
                'monday': '9:00 AM - 5:00 PM',
                'tuesday': '9:00 AM - 5:00 PM',
                'wednesday': '9:00 AM - 5:00 PM',
                'thursday': '9:00 AM - 5:00 PM',
                'friday': '9:00 AM - 3:00 PM'
            }
        })

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        # Get the user's location
        user_city = request.user.city
        user_state = request.user.state
        
        # First, get caregivers in the same city
        local_caregivers = self.queryset.filter(
            user__city=user_city,
            is_available=True
        ).order_by('-rating')[:3]
        
        # If we don't have enough local caregivers, add some from the same state
        if local_caregivers.count() < 3:
            state_caregivers = self.queryset.filter(
                user__state=user_state,
                is_available=True
            ).exclude(
                id__in=local_caregivers.values_list('id', flat=True)
            ).order_by('-rating')[:3-local_caregivers.count()]
            
            caregivers = list(local_caregivers) + list(state_caregivers)
        else:
            caregivers = list(local_caregivers)
        
        serializer = self.get_serializer(caregivers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get aggregated stats for the logged-in caregiver"""
        try:
            caregiver = Caregiver.objects.get(user=request.user)
            
            # Calculate aggregate rating
            reviews = CaregiverReview.objects.filter(caregiver=caregiver)
            total_reviews = reviews.count()
            
            if total_reviews > 0:
                total_rating = sum(review.rating for review in reviews)
                rating = round(total_rating / total_reviews, 1)
            else:
                rating = 0.0
            
            # Get appointment stats
            current_month = timezone.now().month
            current_year = timezone.now().year
            appointments = Appointment.objects.filter(caregiver=caregiver)
            
            total_appointments = appointments.count()
            monthly_appointments = appointments.filter(
                date__month=current_month,
                date__year=current_year
            ).count()
            
            return Response({
                'rating': rating,
                'total_reviews': total_reviews,
                'total_appointments': total_appointments,
                'monthly_appointments': monthly_appointments,
            })
        except Caregiver.DoesNotExist:
            return Response(
                {"error": "Caregiver profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def reviews(self, request):
        """Get all reviews for the logged-in caregiver"""
        try:
            caregiver = Caregiver.objects.get(user=request.user)
            reviews = CaregiverReview.objects.filter(caregiver=caregiver).order_by('-created_at')
            serializer = CaregiverReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        except Caregiver.DoesNotExist:
            return Response(
                {"error": "Caregiver profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class PregnantWomanViewSet(viewsets.ModelViewSet):
    queryset = PregnantWoman.objects.all()
    serializer_class = PregnantWomanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action == 'me':
            return PregnantWoman.objects.filter(user=self.request.user)
        return PregnantWoman.objects.none()  # Regular users shouldn't list all pregnant women

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            pregnant_woman = self.get_queryset().get()
            serializer = self.get_serializer(pregnant_woman)
            return Response(serializer.data)
        except PregnantWoman.DoesNotExist:
            return Response(
                {"detail": "Pregnant woman profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except PregnantWoman.MultipleObjectsReturned:
            # This shouldn't happen, but handle it just in case
            pregnant_woman = self.get_queryset().first()
            serializer = self.get_serializer(pregnant_woman)
            return Response(serializer.data)

class CaregiverExperienceViewSet(viewsets.ModelViewSet):
    queryset = CaregiverExperience.objects.all()
    serializer_class = CaregiverExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'caregiver_profile'):
            return CaregiverExperience.objects.filter(caregiver=self.request.user.caregiver_profile)
        return CaregiverExperience.objects.none()

    def perform_create(self, serializer):
        serializer.save(caregiver=self.request.user.caregiver_profile)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'message': 'Please provide both username and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    else:
        return Response({
            'message': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
