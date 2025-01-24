from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('pregnant', 'Pregnant Woman'),
        ('caregiver', 'Caregiver'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} - {self.get_user_type_display()}"

class Caregiver(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='caregiver_profile')
    bio = models.TextField()
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        default=0.0
    )
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Certifications and qualifications
    certifications = models.JSONField(default=list)  # List of certification details
    specializations = models.JSONField(default=list)  # List of specialization areas
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Caregiver"

class PregnantWoman(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pregnant_profile')
    due_date = models.DateField(null=True, blank=True)
    pregnancy_week = models.PositiveIntegerField(
        validators=[MaxValueValidator(42)],
        help_text="Current week of pregnancy"
    )
    medical_conditions = models.JSONField(default=list)  # List of any medical conditions
    preferences = models.JSONField(default=dict)  # Preferences for caregiver
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.pregnancy_week} weeks"

class CaregiverReview(models.Model):
    caregiver = models.ForeignKey(Caregiver, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(PregnantWoman, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('caregiver', 'reviewer')
    
    def save(self, *args, **kwargs):
        # Update caregiver's average rating
        super().save(*args, **kwargs)
        reviews = self.caregiver.reviews.all()
        self.caregiver.rating = sum(review.rating for review in reviews) / len(reviews)
        self.caregiver.total_reviews = len(reviews)
        self.caregiver.save()
    
    def __str__(self):
        return f"Review for {self.caregiver.user.get_full_name()} by {self.reviewer.user.get_full_name()}"

class CaregiverExperience(models.Model):
    caregiver = models.ForeignKey(Caregiver, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    is_current = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} at {self.organization} - {self.caregiver.user.get_full_name()}"
