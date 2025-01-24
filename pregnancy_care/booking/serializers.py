from rest_framework import serializers
from .models import Appointment
from account.serializers import UserSerializer, CaregiverSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    caregiver_details = CaregiverSerializer(source='caregiver', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'caregiver', 'title', 'description',
            'date', 'time', 'duration', 'status', 'created_at',
            'updated_at', 'patient_details', 'caregiver_details'
        ]
        read_only_fields = ['patient', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['patient'] = self.context['request'].user
        return super().create(validated_data)
