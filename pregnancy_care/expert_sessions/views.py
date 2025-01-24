from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Expert, Session, SessionBooking, Appointment
from .serializers import (
    ExpertSerializer, SessionSerializer, SessionBookingSerializer,
    AppointmentSerializer
)

# Create your views here.

class ExpertViewSet(viewsets.ModelViewSet):
    queryset = Expert.objects.all()
    serializer_class = ExpertSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['specialization', 'user__city', 'user__state']
    ordering_fields = ['consultation_fee', 'experience_years']

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        expert = self.get_object()
        sessions = Session.objects.filter(expert=expert)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        expert = self.get_object()
        return Response({
            'available_days': expert.available_days,
            'consultation_fee': expert.consultation_fee
        })

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'expert__specialization']
    ordering_fields = ['date', 'fee']

    def get_queryset(self):
        queryset = Session.objects.all()
        session_type = self.request.query_params.get('session_type', None)
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        return queryset

    @action(detail=True, methods=['post'])
    def book(self, request, pk=None):
        session = self.get_object()
        pregnant_woman = request.user.pregnant_profile

        # Check if session is full
        if SessionBooking.objects.filter(session=session, status='confirmed').count() >= session.max_participants:
            return Response(
                {'error': 'Session is already full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking = SessionBooking.objects.create(
            session=session,
            participant=pregnant_woman,
            status='pending'
        )
        serializer = SessionBookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SessionBookingViewSet(viewsets.ModelViewSet):
    queryset = SessionBooking.objects.all()
    serializer_class = SessionBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'pregnant':
            return SessionBooking.objects.filter(participant__user=user)
        elif hasattr(user, 'expert'):
            return SessionBooking.objects.filter(session__expert__user=user)
        return SessionBooking.objects.none()

    def perform_create(self, serializer):
        serializer.save(participant=self.request.user.pregnant_profile)

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'doctor_name', 'appointment_type']
    ordering_fields = ['date', 'time']

    def get_queryset(self):
        if self.request.user.user_type == 'pregnant':
            return Appointment.objects.filter(pregnant_woman__user=self.request.user)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        serializer.save(pregnant_woman=self.request.user.pregnant_profile)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        appointments = self.get_queryset().filter(
            date__gte=timezone.now().date(),
            status='scheduled'
        ).order_by('date', 'time')
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
