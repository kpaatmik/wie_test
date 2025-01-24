from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from django.db import transaction
from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience
from .serializers import (
    UserSerializer, PregnantWomanSerializer, CaregiverSerializer,
    CaregiverReviewSerializer, CaregiverExperienceSerializer,
    UserRegistrationSerializer
)
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
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
            caregiver = self.queryset.get(user=request.user)
            serializer = self.get_serializer(caregiver)
            return Response(serializer.data)
        except Caregiver.DoesNotExist:
            return Response(
                {'error': 'Caregiver profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def retrieve(self, request, pk=None):
        try:
            caregiver = self.get_object()
            serializer = self.get_serializer(caregiver)
            return Response(serializer.data)
        except Caregiver.DoesNotExist:
            return Response(
                {'error': 'Caregiver not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        caregiver = self.get_object()
        pregnant_woman = request.user.pregnant_profile
        
        serializer = CaregiverReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(caregiver=caregiver, reviewer=pregnant_woman)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class PregnantWomanViewSet(viewsets.ModelViewSet):
    queryset = PregnantWoman.objects.all()
    serializer_class = PregnantWomanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'pregnant':
            return PregnantWoman.objects.filter(user=self.request.user)
        return PregnantWoman.objects.none()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.user_type != 'pregnant':
            return Response({
                'message': 'Only pregnant users can access this endpoint'
            }, status=status.HTTP_403_FORBIDDEN)
        
        pregnant_woman = get_object_or_404(PregnantWoman, user=request.user)
        serializer = self.get_serializer(pregnant_woman)
        return Response(serializer.data)

class CaregiverExperienceViewSet(viewsets.ModelViewSet):
    queryset = CaregiverExperience.objects.all()
    serializer_class = CaregiverExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

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
