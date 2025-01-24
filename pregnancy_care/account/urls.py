from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CaregiverViewSet, PregnantWomanViewSet,
    CaregiverExperienceViewSet, login_view
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'caregivers', CaregiverViewSet)
router.register(r'pregnant-women', PregnantWomanViewSet)
router.register(r'caregiver-experiences', CaregiverExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
]
