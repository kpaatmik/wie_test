import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pregnancy_care.settings')
django.setup()

from account.models import User, Caregiver, CaregiverExperience, CaregiverReview

print("\n=== Users ===")
users = User.objects.all()
for user in users:
    print(f"ID: {user.id}, Username: {user.username}, Name: {user.get_full_name()}, Type: {user.user_type}")

print("\n=== Caregivers ===")
caregivers = Caregiver.objects.all()
for caregiver in caregivers:
    print(f"\nCaregiver ID: {caregiver.id}")
    print(f"User: {caregiver.user.get_full_name()}")
    print(f"Bio: {caregiver.bio}")
    print(f"Rating: {caregiver.rating}")
    print(f"Total Reviews: {caregiver.total_reviews}")
    print(f"Hourly Rate: ${caregiver.hourly_rate}")
    print(f"Specializations: {caregiver.specializations}")
    
    print("\nExperiences:")
    experiences = CaregiverExperience.objects.filter(caregiver=caregiver)
    for exp in experiences:
        print(f"- {exp.title} at {exp.organization}")
        print(f"  From: {exp.start_date} To: {exp.end_date}")
        print(f"  Description: {exp.description}")
    
    print("\nReviews:")
    reviews = CaregiverReview.objects.filter(caregiver=caregiver)
    for review in reviews:
        print(f"- Rating: {review.rating}/5")
        print(f"  By: {review.reviewer.user.get_full_name()}")
        print(f"  Date: {review.created_at}")
        print(f"  Comment: {review.comment}")
