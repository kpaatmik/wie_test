import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pregnancy_care.settings')
django.setup()

from account.models import User, Caregiver, CaregiverExperience, CaregiverReview
from django.contrib.auth.hashers import make_password

def create_test_caregivers():
    # Create test caregivers with unique data
    caregivers_data = [
        {
            'user': {
                'username': 'sarah_johnson',
                'password': make_password('password123'),
                'email': 'sarah.johnson@example.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'user_type': 'caregiver',
                'phone_number': '+1 (555) 123-4567',
                'city': 'San Francisco',
                'state': 'California',
            },
            'bio': 'Experienced caregiver specializing in prenatal care with over 10 years of experience.',
            'experience_years': 10,
            'hourly_rate': 45.00,
            'specializations': ['Prenatal Care', 'High-Risk Pregnancy', 'Lactation Support'],
            'certifications': [
                {
                    'name': 'Certified Nurse-Midwife (CNM)',
                    'issuing_organization': 'American Midwifery Certification Board',
                    'expiry_date': '2025-12-31'
                }
            ]
        },
        {
            'user': {
                'username': 'emma_wilson',
                'password': make_password('password123'),
                'email': 'emma.wilson@example.com',
                'first_name': 'Emma',
                'last_name': 'Wilson',
                'user_type': 'caregiver',
                'phone_number': '+1 (555) 234-5678',
                'city': 'Los Angeles',
                'state': 'California',
            },
            'bio': 'Specialized in postnatal care and newborn support. Certified lactation consultant.',
            'experience_years': 7,
            'hourly_rate': 40.00,
            'specializations': ['Postnatal Care', 'Newborn Care', 'Lactation Support'],
            'certifications': [
                {
                    'name': 'International Board Certified Lactation Consultant',
                    'issuing_organization': 'IBLCE',
                    'expiry_date': '2024-06-30'
                }
            ]
        },
        {
            'user': {
                'username': 'maria_garcia',
                'password': make_password('password123'),
                'email': 'maria.garcia@example.com',
                'first_name': 'Maria',
                'last_name': 'Garcia',
                'user_type': 'caregiver',
                'phone_number': '+1 (555) 345-6789',
                'city': 'San Diego',
                'state': 'California',
            },
            'bio': 'Bilingual caregiver with expertise in cultural sensitivity and family support.',
            'experience_years': 5,
            'hourly_rate': 35.00,
            'specializations': ['Family Care', 'Cultural Support', 'Prenatal Education'],
            'certifications': [
                {
                    'name': 'Certified Doula',
                    'issuing_organization': 'DONA International',
                    'expiry_date': '2024-12-31'
                }
            ]
        }
    ]

    for caregiver_data in caregivers_data:
        # Create user
        user_data = caregiver_data.pop('user')
        user = User.objects.create(**user_data)

        # Create caregiver
        caregiver = Caregiver.objects.create(user=user, **caregiver_data)

        # Add experience
        CaregiverExperience.objects.create(
            caregiver=caregiver,
            title=f"Senior Caregiver at {caregiver.user.city} Medical Center",
            organization=f"{caregiver.user.city} Medical Center",
            start_date=date(2020, 1, 1),
            end_date=None,
            description=f"Providing comprehensive care services in {caregiver.user.city}",
            is_current=True
        )

    print("Test caregivers created successfully!")

if __name__ == '__main__':
    create_test_caregivers()
