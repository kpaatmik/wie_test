from django.shortcuts import render
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.db import transaction
from django.db.models import Avg
from django.utils import timezone
from django.db import models
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
import json

from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience, IDVerification
from booking.models import Appointment
from .serializers import (
    UserSerializer, PregnantWomanSerializer, CaregiverSerializer,
    CaregiverReviewSerializer, CaregiverExperienceSerializer,
    UserRegistrationSerializer, IDVerificationSerializer
)

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'register']:
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
                pregnancy_week = request.data.get('pregnancy_week', 1)
                due_date = request.data.get('due_date')
                medical_conditions = request.data.get('medical_conditions', [])
                preferences = request.data.get('preferences', {})
                
                if isinstance(medical_conditions, str):
                    try:
                        medical_conditions = json.loads(medical_conditions)
                    except:
                        medical_conditions = []
                
                if isinstance(preferences, str):
                    try:
                        preferences = json.loads(preferences)
                    except:
                        preferences = {}
                
                PregnantWoman.objects.create(
                    user=user,
                    pregnancy_week=pregnancy_week,
                    due_date=due_date,
                    medical_conditions=medical_conditions,
                    preferences=preferences
                )
            elif user.user_type == 'caregiver':
                certifications = request.data.get('certifications', [])
                specializations = request.data.get('specializations', [])
                
                # Handle JSON string conversion if needed
                if isinstance(certifications, str):
                    try:
                        certifications = json.loads(certifications)
                    except:
                        certifications = []
                
                if isinstance(specializations, str):
                    try:
                        specializations = json.loads(specializations)
                    except:
                        specializations = []
                
                caregiver_data = {
                    'user': user,
                    'bio': request.data.get('bio', ''),
                    'hourly_rate': request.data.get('hourly_rate', 0),
                    'experience_years': request.data.get('experience_years'),
                    'certifications': certifications,
                    'specializations': specializations,
                    'is_available': True,
                }
                Caregiver.objects.create(**caregiver_data)
            
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Registration successful. Please complete your ID verification.',
                'requires_verification': True
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
        data = serializer.data
        try:
            verification = IDVerification.objects.get(user=request.user)
            data['is_verified'] = verification.is_verified
            data['verification_status'] = verification.verification_status
        except IDVerification.DoesNotExist:
            data['is_verified'] = False
            data['verification_status'] = None
        return Response(data)

    @action(detail=False, methods=['get'])
    def status(self, request):
        try:
            verification = IDVerification.objects.get(user=request.user)
            serializer = IDVerificationSerializer(verification)
            return Response(serializer.data)
        except IDVerification.DoesNotExist:
            return Response({
                'verification_status': None,
                'is_verified': False
            })

class IDVerificationViewSet(viewsets.ModelViewSet):
    serializer_class = IDVerificationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return IDVerification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if verification already exists
        try:
            existing = IDVerification.objects.get(user=self.request.user)
            if existing.verification_status == 'pending':
                raise serializers.ValidationError({
                    'detail': 'You already have a pending verification request.'
                })
            existing.delete()  # Delete if rejected to allow resubmission
        except IDVerification.DoesNotExist:
            pass
        
        serializer.save(
            user=self.request.user,
            verification_status='pending',
            is_verified=False
        )

    @action(detail=False, methods=['get'])
    def status(self, request):
        try:
            verification = IDVerification.objects.get(user=request.user)
            return Response({
                'verification_status': verification.verification_status,
                'is_verified': verification.is_verified,
                'id_type': verification.id_type,
                'submission_date': verification.submission_date
            })
        except IDVerification.DoesNotExist:
            return Response({
                'verification_status': None,
                'is_verified': False
            })

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
