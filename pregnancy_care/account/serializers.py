from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience, IDVerification
from django.db.models import Avg

class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'user_type',
                 'phone_number', 'address', 'city', 'state', 'profile_picture', 'profile_picture_url')
        extra_kwargs = {'password': {'write_only': True}}

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CaregiverExperienceSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(format='%Y-%m-%d')
    end_date = serializers.DateField(format='%Y-%m-%d', allow_null=True)
    
    class Meta:
        model = CaregiverExperience
        fields = ('id', 'title', 'organization', 'start_date', 'end_date', 'description', 'is_current')

class CaregiverReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format='%Y-%m-%d')

    class Meta:
        model = CaregiverReview
        fields = ('id', 'caregiver', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('reviewer_name',)

    def get_reviewer_name(self, obj):
        if obj.reviewer and obj.reviewer.user:
            return f"{obj.reviewer.user.first_name} {obj.reviewer.user.last_name}".strip() or "Anonymous"
        return "Anonymous"

class CaregiverSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    experiences = CaregiverExperienceSerializer(many=True, read_only=True)
    reviews = CaregiverReviewSerializer(many=True, read_only=True)
    languages = serializers.ListField(child=serializers.CharField(), default=['English'])
    availability = serializers.JSONField(default=dict)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Caregiver
        fields = ('id', 'user', 'bio', 'experience_years', 'hourly_rate', 'is_available',
                 'rating', 'certifications', 'specializations', 'profile_picture',
                 'experiences', 'reviews', 'languages', 'availability', 'created_at', 'updated_at', 'average_rating', 'total_reviews')
        read_only_fields = ('id', 'user', 'rating', 'average_rating', 'total_reviews')

    def get_average_rating(self, obj):
        avg = CaregiverReview.objects.filter(caregiver=obj).aggregate(avg=Avg('rating'))['avg']
        return round(float(avg), 1) if avg is not None else 0.0

    def get_total_reviews(self, obj):
        return CaregiverReview.objects.filter(caregiver=obj).count()
        
    def get_profile_picture(self, obj):
        if obj.user.profile_picture:
            return obj.user.profile_picture.url
        return None

class PregnantWomanSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PregnantWoman
        fields = ('id', 'user', 'due_date', 'pregnancy_week', 'medical_conditions',
                 'preferences', 'created_at', 'updated_at')

class IDVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IDVerification
        fields = ['id', 'id_type', 'id_number', 'id_front_image', 'id_back_image', 
                 'verification_status', 'submission_date', 'is_verified']
        read_only_fields = ['verification_status', 'submission_date', 'is_verified']

    def validate_id_number(self, value):
        # Add basic validation for ID number format
        if len(value) < 6:
            raise serializers.ValidationError("ID number must be at least 6 characters long")
        return value

    def validate(self, data):
        # Ensure both images are provided for new submissions
        if self.instance is None:  # Only for new submissions
            if not data.get('id_front_image'):
                raise serializers.ValidationError({
                    'id_front_image': 'Front image of ID is required'
                })
            if not data.get('id_back_image'):
                raise serializers.ValidationError({
                    'id_back_image': 'Back image of ID is required'
                })
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    hourly_rate = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, allow_null=True)
    experience_years = serializers.IntegerField(required=False, allow_null=True)
    certifications = serializers.ListField(child=serializers.CharField(), required=False)
    specializations = serializers.ListField(child=serializers.CharField(), required=False)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'phone_number', 'address', 'city', 'state', 'user_type', 'profile_picture',
            'bio', 'hourly_rate', 'experience_years', 'certifications', 'specializations'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone_number': {'required': True},
            'address': {'required': True},
            'city': {'required': True},
            'state': {'required': True},
            'user_type': {'required': True},
        }

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError({'password2': "Passwords don't match"})
        
        # Validate caregiver-specific fields
        if data.get('user_type') == 'caregiver':
            if not data.get('bio'):
                raise serializers.ValidationError({'bio': 'Bio is required for caregivers'})
            if data.get('hourly_rate') is None:
                raise serializers.ValidationError({'hourly_rate': 'Hourly rate is required for caregivers'})
            if data.get('experience_years') is None:
                raise serializers.ValidationError({'experience_years': 'Experience years is required for caregivers'})
        
        return data

    def create(self, validated_data):
        # Remove caregiver-specific fields from user creation
        bio = validated_data.pop('bio', '')
        hourly_rate = validated_data.pop('hourly_rate', None)
        experience_years = validated_data.pop('experience_years', None)
        certifications = validated_data.pop('certifications', [])
        specializations = validated_data.pop('specializations', [])
        
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user
