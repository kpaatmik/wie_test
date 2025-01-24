from django.db import models
from django.conf import settings
from account.models import Caregiver, PregnantWoman

# Create your models here.

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    caregiver = models.ForeignKey(Caregiver, on_delete=models.CASCADE, related_name='appointments')
    title = models.CharField(max_length=200, blank=True, default='Appointment')
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text='Duration in minutes', default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.caregiver.user.get_full_name()} - {self.date}"

class Session(models.Model):
    SESSION_TYPES = [
        ('routine', 'Routine'),
        ('emergency', 'Emergency'),
        ('follow_up', 'Follow Up'),
    ]

    pregnant_woman = models.ForeignKey(
        PregnantWoman, 
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True,
        blank=True
    )
    caregiver = models.ForeignKey(
        Caregiver, 
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True,
        blank=True
    )
    date = models.DateTimeField()
    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPES,
        default='routine'
    )
    description = models.TextField()
    meet_link = models.URLField(max_length=200)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Session on {self.date} - {self.session_type}"
