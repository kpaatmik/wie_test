from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from .models import Appointment, Session
from .serializers import AppointmentSerializer, SessionSerializer
from account.models import PregnantWoman, Caregiver
from django.shortcuts import get_object_or_404

# Create your views here.

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'caregiver_profile'):
            return Appointment.objects.filter(caregiver=user.caregiver_profile).order_by('-date', '-time')
        elif hasattr(user, 'pregnant_profile'):
            return Appointment.objects.filter(patient=user).order_by('-date', '-time')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'pregnant_profile'):
            raise permissions.PermissionDenied("Only pregnant women can book appointments")
        
        if not all(field in self.request.data for field in ['caregiver', 'date', 'time']):
            raise serializers.ValidationError("Please provide date and time for the appointment")
            
        try:
            caregiver = Caregiver.objects.get(id=self.request.data['caregiver'])
            serializer.save(
                patient=self.request.user,
                caregiver=caregiver,
                status='pending'  # Set initial status as pending
            )
        except Caregiver.DoesNotExist:
            raise serializers.ValidationError("Invalid caregiver selected")

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        
        # Check if the appointment can be cancelled
        if appointment.status not in ['pending', 'confirmed']:
            return Response(
                {'detail': 'Cannot cancel appointment that is already cancelled or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user has permission to cancel
        if (not hasattr(request.user, 'pregnant_profile') or request.user != appointment.patient) and \
           (not hasattr(request.user, 'caregiver_profile') or request.user.caregiver_profile != appointment.caregiver):
            return Response(
                {'detail': 'You do not have permission to cancel this appointment'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Cancel the appointment
        appointment.status = 'cancelled'
        appointment.save()

        return Response(
            {'detail': 'Appointment cancelled successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today = timezone.now().date()
        if hasattr(request.user, 'caregiver_profile'):
            upcoming = Appointment.objects.filter(
                caregiver=request.user.caregiver_profile,
                date__gte=today
            ).order_by('date', 'time')
        else:
            upcoming = Appointment.objects.filter(
                patient=request.user,
                date__gte=today
            ).order_by('date', 'time')
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        
        # Check if appointment can be confirmed
        if appointment.status != 'pending':
            return Response(
                {'error': 'Can only confirm pending appointments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if not hasattr(request.user, 'caregiver_profile') or request.user.caregiver_profile != appointment.caregiver:
            return Response(
                {'error': 'Only the assigned caregiver can confirm appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Confirm the appointment
        appointment.status = 'confirmed'
        appointment.save()
        
        return Response({
            'message': 'Appointment confirmed successfully',
            'appointment': self.get_serializer(appointment).data
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        if not hasattr(request.user, 'caregiver_profile') or request.user.caregiver_profile != appointment.caregiver:
            raise permissions.PermissionDenied("Only the assigned caregiver can complete appointments")
        
        appointment.status = 'completed'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'pregnant_woman'):
            return Session.objects.filter(pregnant_woman=user.pregnant_woman)
        elif hasattr(user, 'caregiver'):
            return Session.objects.filter(caregiver=user.caregiver)
        return Session.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'pregnant_woman'):
            # For pregnant women creating sessions
            serializer.save(
                pregnant_woman=user.pregnant_woman,
                session_type='routine'  # Default type
            )
        elif hasattr(user, 'caregiver'):
            # For caregivers creating sessions
            serializer.save(
                caregiver=user.caregiver,
                session_type='routine'  # Default type
            )
        else:
            raise PermissionError("User must be either a pregnant woman or caregiver")

class UpcomingAppointmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        user = request.user
        
        if hasattr(user, 'caregiver_profile'):
            appointments = Appointment.objects.filter(
                caregiver=user.caregiver_profile,
                date__gte=today,
                status='confirmed'
            ).order_by('date', 'time')[:5]
        elif hasattr(user, 'pregnant_profile'):
            appointments = Appointment.objects.filter(
                patient=user,
                date__gte=today,
                status='confirmed'
            ).order_by('date', 'time')[:5]
        else:
            appointments = []
        
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
