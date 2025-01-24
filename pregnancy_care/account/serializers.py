from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type',
                 'phone_number', 'address', 'city', 'state', 'profile_picture')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CaregiverExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaregiverExperience
        fields = '__all__'

class CaregiverReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = CaregiverReview
        fields = ('id', 'caregiver', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('reviewer_name',)

    def get_reviewer_name(self, obj):
        return obj.reviewer.user.get_full_name()

class CaregiverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    experiences = CaregiverExperienceSerializer(many=True, read_only=True)
    reviews = CaregiverReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Caregiver
        fields = ('id', 'user', 'bio', 'experience_years', 'hourly_rate', 'is_available',
                 'rating', 'total_reviews', 'certifications', 'specializations',
                 'experiences', 'reviews', 'created_at', 'updated_at')

class PregnantWomanSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PregnantWoman
        fields = ('id', 'user', 'due_date', 'pregnancy_week', 'medical_conditions',
                 'preferences', 'created_at', 'updated_at')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name',
                 'user_type', 'phone_number', 'address', 'city', 'state')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'user_type': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, data):
        if data.get('password') != data.pop('password2', None):
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        if len(data.get('password', '')) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long"})
        return data

    def create(self, validated_data):
        try:
            user = User.objects.create_user(**validated_data)
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))
