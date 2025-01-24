from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from account.models import PregnantWoman, Caregiver, CaregiverExperience, CaregiverReview
from expert_sessions.models import Expert, Session, SessionBooking, Appointment
from social.models import Post, Comment, Like, Follow, SavedPost
from faker import Faker
from datetime import datetime, timedelta
import random

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Populates the database with fake data'

    def create_users(self):
        # Create pregnant women users
        pregnant_users = []
        for _ in range(10):
            user = User.objects.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password='password123',
                first_name=fake.first_name_female(),
                last_name=fake.last_name(),
                user_type='pregnant',
                phone_number=fake.phone_number(),
                address=fake.street_address(),
                city=fake.city(),
                state=fake.state()
            )
            pregnant_users.append(user)
            
            # Create pregnant woman profile
            PregnantWoman.objects.create(
                user=user,
                due_date=fake.date_between(start_date='+1m', end_date='+9m'),
                pregnancy_week=random.randint(1, 40),
                medical_conditions=fake.text(max_nb_chars=200) if random.choice([True, False]) else ''
            )

        # Create caregiver users
        caregiver_users = []
        for _ in range(15):
            user = User.objects.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                user_type='caregiver',
                phone_number=fake.phone_number(),
                address=fake.street_address(),
                city=fake.city(),
                state=fake.state()
            )
            caregiver_users.append(user)
            
            # Create caregiver profile
            caregiver = Caregiver.objects.create(
                user=user,
                bio=fake.text(max_nb_chars=300),
                experience_years=random.randint(1, 20),
                hourly_rate=random.randint(20, 100),
                is_available=random.choice([True, False]),
                specializations=['Prenatal Care', 'Postnatal Care', 'Lactation Support'],
                certifications=['Certified Nurse Midwife', 'Doula Certification']
            )

            # Create experiences for each caregiver
            for _ in range(random.randint(2, 4)):
                start_date = fake.date_between(start_date='-10y', end_date='-1y')
                is_current = random.choice([True, False])
                CaregiverExperience.objects.create(
                    caregiver=caregiver,
                    title=fake.job(),
                    organization=fake.company(),
                    start_date=start_date,
                    end_date=None if is_current else fake.date_between(start_date=start_date, end_date='today'),
                    description=fake.text(max_nb_chars=200),
                    is_current=is_current
                )

            # Create reviews for each caregiver
            if pregnant_users:  # Only create reviews if we have pregnant users
                for reviewer in random.sample(pregnant_users, random.randint(0, min(3, len(pregnant_users)))):
                    CaregiverReview.objects.create(
                        caregiver=caregiver,
                        reviewer=PregnantWoman.objects.get(user=reviewer),
                        rating=random.randint(3, 5),  # Slightly biased towards positive reviews
                        comment=fake.text(max_nb_chars=200)
                    )

        # Create expert users
        expert_users = []
        specializations = [choice[0] for choice in Expert.SPECIALIZATION_CHOICES]
        for _ in range(5):
            user = User.objects.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                user_type='expert',
                phone_number=fake.phone_number(),
                address=fake.street_address(),
                city=fake.city(),
                state=fake.state()
            )
            expert_users.append(user)
            
            # Create expert profile
            Expert.objects.create(
                user=user,
                specialization=random.choice(specializations),
                qualification=fake.job(),
                experience_years=random.randint(5, 25),
                consultation_fee=random.randint(50, 200),
                bio=fake.text(max_nb_chars=300),
                available_days=['Monday', 'Wednesday', 'Friday']
            )

        return pregnant_users, caregiver_users, expert_users

    def create_sessions_and_appointments(self, experts, pregnant_women):
        # Create expert sessions
        sessions = []
        session_types = [choice[0] for choice in Session.SESSION_TYPE_CHOICES]
        topics = [
            'Prenatal Nutrition', 'Labor Preparation', 'Breastfeeding Basics',
            'Postpartum Care', 'Newborn Care', 'Pregnancy Exercise',
            'Mental Health During Pregnancy', 'Birth Planning'
        ]
        
        for expert in experts:
            for _ in range(random.randint(2, 5)):
                start_time = fake.future_datetime(end_date='+30d')
                session = Session.objects.create(
                    expert=expert,
                    title=random.choice(topics),
                    description=fake.text(max_nb_chars=300),
                    session_type=random.choice(session_types),
                    date=start_time.date(),
                    start_time=start_time.time(),
                    duration=random.choice([30, 45, 60, 90]),
                    max_participants=random.randint(5, 20),
                    fee=random.randint(0, 100)
                )
                sessions.append(session)

        # Create appointments
        appointment_types = [choice[0] for choice in Appointment.APPOINTMENT_TYPE_CHOICES]
        for pregnant_woman in pregnant_women:
            for _ in range(random.randint(1, 3)):
                appt_date = fake.future_datetime(end_date='+60d')
                Appointment.objects.create(
                    pregnant_woman=pregnant_woman,
                    appointment_type=random.choice(appointment_types),
                    title=f"{fake.word().title()} Checkup",
                    description=fake.text(max_nb_chars=200),
                    date=appt_date.date(),
                    time=appt_date.time(),
                    location=fake.address(),
                    doctor_name=fake.name(),
                    notes=fake.text(max_nb_chars=200) if random.choice([True, False]) else ''
                )

        return sessions

    def create_social_content(self, users):
        # Create posts
        posts = []
        post_types = [choice[0] for choice in Post.POST_TYPE_CHOICES]
        for _ in range(30):
            user = random.choice(users)
            post = Post.objects.create(
                author=user,
                content=fake.text(max_nb_chars=500),
                post_type=random.choice(post_types),
                is_expert_verified=random.choice([True, False]) if user.user_type == 'expert' else False,
                tags=['pregnancy', 'health', 'care'] if random.choice([True, False]) else []
            )
            posts.append(post)
            
            # Create comments
            for _ in range(random.randint(0, 5)):
                comment = Comment.objects.create(
                    post=post,
                    author=random.choice(users),
                    content=fake.text(max_nb_chars=200)
                )
                
                # Create some replies
                if random.choice([True, False]):
                    for _ in range(random.randint(1, 3)):
                        Comment.objects.create(
                            post=post,
                            author=random.choice(users),
                            content=fake.text(max_nb_chars=200),
                            parent_comment=comment
                        )
            
            # Create likes
            for user in random.sample(users, random.randint(0, len(users)//3)):
                Like.objects.create(
                    user=user,
                    post=post
                )

            # Create some saved posts
            for user in random.sample(users, random.randint(0, len(users)//4)):
                SavedPost.objects.create(
                    user=user,
                    post=post
                )

        # Create follows
        for user in users:
            # Each user follows some random users
            for followed_user in random.sample(users, random.randint(0, len(users)//3)):
                if user != followed_user:
                    Follow.objects.create(
                        follower=user,
                        following=followed_user
                    )

    def handle(self, *args, **options):
        self.stdout.write('Creating fake users...')
        pregnant_users, caregiver_users, expert_users = self.create_users()
        
        self.stdout.write('Creating expert sessions and appointments...')
        experts = Expert.objects.all()
        pregnant_women = PregnantWoman.objects.all()
        sessions = self.create_sessions_and_appointments(experts, pregnant_women)
        
        self.stdout.write('Creating social content...')
        all_users = list(User.objects.all())
        self.create_social_content(all_users)
        
        self.stdout.write(self.style.SUCCESS('Successfully populated the database with fake data!'))
