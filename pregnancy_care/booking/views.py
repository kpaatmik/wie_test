from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Appointment
from .serializers import AppointmentSerializer

# Create your views here.

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'caregiver_profile'):
            return Appointment.objects.filter(caregiver=user.caregiver_profile)
        return Appointment.objects.filter(patient=user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today = timezone.now().date()
        upcoming = Appointment.objects.filter(
            patient=request.user,
            date__gte=today,
            status='confirmed'
        ).order_by('date', 'time')[:5]
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
