from rest_framework import serializers
from .models import Appointment, Session
from account.serializers import UserSerializer, CaregiverSerializer, PregnantWomanSerializer
from account.models import PregnantWoman, Caregiver
from django.utils import timezone

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    caregiver_details = CaregiverSerializer(source='caregiver', read_only=True)
    caregiver_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'caregiver', 'title', 'description',
            'date', 'time', 'duration', 'status', 'created_at',
            'updated_at', 'patient_details', 'caregiver_details',
            'caregiver_name', 'patient_name'
        ]
        read_only_fields = ['patient', 'created_at', 'updated_at', 'caregiver_name', 'patient_name']
        extra_kwargs = {
            'title': {'required': False},
            'description': {'required': False},
            'duration': {'required': False}
        }

    def get_caregiver_name(self, obj):
        if obj.caregiver and obj.caregiver.user:
            return f"Dr. {obj.caregiver.user.first_name} {obj.caregiver.user.last_name}"
        return "Unknown Caregiver"

    def get_patient_name(self, obj):
        if obj.patient:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return "Unknown Patient"

    def create(self, validated_data):
        # Set default values if not provided
        if 'title' not in validated_data:
            validated_data['title'] = 'Appointment'
        if 'duration' not in validated_data:
            validated_data['duration'] = 60
            
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)

class SessionSerializer(serializers.ModelSerializer):
    pregnant_woman_details = PregnantWomanSerializer(source='pregnant_woman', read_only=True)
    caregiver_details = CaregiverSerializer(source='caregiver', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'date', 'session_type', 'description', 'meet_link',
            'is_completed', 'created_at', 'updated_at',
            'pregnant_woman_details', 'caregiver_details',
            'pregnant_woman', 'caregiver'
        ]
        read_only_fields = ['is_completed', 'created_at', 'updated_at', 'pregnant_woman', 'caregiver']
        extra_kwargs = {
            'pregnant_woman': {'required': False},
            'caregiver': {'required': False},
            'description': {'required': True},
            'meet_link': {'required': True},
            'session_type': {'required': True}
        }

    def validate_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Session date cannot be in the past")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User must be authenticated")

        # Set the user based on their role
        if hasattr(request.user, 'pregnant_woman'):
            validated_data['pregnant_woman'] = request.user.pregnant_woman
        elif hasattr(request.user, 'caregiver'):
            validated_data['caregiver'] = request.user.caregiver
        else:
            raise serializers.ValidationError("User must be either a pregnant woman or caregiver")

        return super().create(validated_data)
