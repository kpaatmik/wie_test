from django.db import models
from account.models import User, PregnantWoman

class Expert(models.Model):
    SPECIALIZATION_CHOICES = (
        ('gynecologist', 'Gynecologist'),
        ('pediatrician', 'Pediatrician'),
        ('nutritionist', 'Nutritionist'),
        ('fitness_expert', 'Fitness Expert'),
        ('mental_health', 'Mental Health Specialist'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    qualification = models.CharField(max_length=200)
    experience_years = models.PositiveIntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    bio = models.TextField()
    available_days = models.JSONField(default=list)  # List of available days
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.get_specialization_display()}"

class Session(models.Model):
    SESSION_TYPE_CHOICES = (
        ('free', 'Free Session'),
        ('paid', 'Paid Consultation'),
    )
    
    SESSION_STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    session_type = models.CharField(max_length=10, choices=SESSION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=SESSION_STATUS_CHOICES, default='scheduled')
    date = models.DateField()
    start_time = models.TimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    max_participants = models.PositiveIntegerField(default=1)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    meeting_link = models.URLField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} by {self.expert.user.get_full_name()}"

class SessionBooking(models.Model):
    BOOKING_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='bookings')
    participant = models.ForeignKey(PregnantWoman, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default='pending')
    booking_time = models.DateTimeField(auto_now_add=True)
    payment_status = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        unique_together = ('session', 'participant')
    
    def __str__(self):
        return f"{self.participant.user.get_full_name()} - {self.session.title}"

class Appointment(models.Model):
    APPOINTMENT_TYPE_CHOICES = (
        ('checkup', 'Regular Checkup'),
        ('scan', 'Ultrasound Scan'),
        ('test', 'Medical Test'),
        ('consultation', 'Consultation'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    pregnant_woman = models.ForeignKey(PregnantWoman, on_delete=models.CASCADE, related_name='appointments')
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(null=True, blank=True)
    reminder_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.pregnant_woman.user.get_full_name()}"
