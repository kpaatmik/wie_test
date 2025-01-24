from rest_framework import serializers
from .models import Appointment
from account.serializers import UserSerializer, CaregiverSerializer
from account.models import PregnantWoman, Caregiver

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
