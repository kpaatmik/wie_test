from rest_framework import serializers
from .models import Expert, Session, SessionBooking, Appointment
from account.serializers import UserSerializer

class ExpertSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Expert
        fields = ('id', 'user', 'specialization', 'qualification', 'experience_years',
                 'consultation_fee', 'bio', 'available_days')

class SessionSerializer(serializers.ModelSerializer):
    expert = ExpertSerializer(read_only=True)
    expert_id = serializers.PrimaryKeyRelatedField(
        queryset=Expert.objects.all(),
        write_only=True,
        source='expert'
    )
    
    class Meta:
        model = Session
        fields = ('id', 'expert', 'expert_id', 'title', 'description', 'session_type',
                 'status', 'date', 'start_time', 'duration', 'max_participants',
                 'fee', 'meeting_link', 'created_at', 'updated_at')

class SessionBookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        write_only=True,
        source='session'
    )
    
    class Meta:
        model = SessionBooking
        fields = ('id', 'session', 'session_id', 'participant', 'status',
                 'booking_time', 'payment_status', 'payment_id')
        read_only_fields = ('participant', 'booking_time')

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('id', 'pregnant_woman', 'appointment_type', 'title', 'description',
                 'date', 'time', 'location', 'doctor_name', 'status', 'notes',
                 'reminder_sent', 'created_at', 'updated_at')
        read_only_fields = ('pregnant_woman', 'reminder_sent')
