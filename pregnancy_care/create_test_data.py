import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pregnancy_care.settings')
django.setup()

from account.models import User, Caregiver, CaregiverExperience, CaregiverReview

# Get an existing caregiver
caregiver = Caregiver.objects.get(user__username='mariaramirez')

# Update caregiver data
caregiver.bio = "Experienced caregiver with over 10 years of experience in prenatal and postnatal care."
caregiver.experience_years = 10
caregiver.hourly_rate = 50.00
caregiver.is_available = True
caregiver.specializations = [
    "Prenatal Care",
    "Postnatal Care",
    "Lactation Support",
    "Newborn Care"
]
caregiver.save()

# Add experience
experience = CaregiverExperience.objects.create(
    caregiver=caregiver,
    title="Senior Prenatal Care Specialist",
    organization="City Hospital",
    start_date=date(2020, 1, 1),
    end_date=date(2023, 12, 31),
    description="Provided comprehensive prenatal care and support to expecting mothers."
)

# Add another experience
experience2 = CaregiverExperience.objects.create(
    caregiver=caregiver,
    title="Maternity Care Coordinator",
    organization="Family Care Center",
    start_date=date(2018, 6, 1),
    end_date=date(2019, 12, 31),
    description="Coordinated maternity care services and provided support to new mothers."
)

print("Test data created successfully!")
