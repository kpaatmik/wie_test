from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'caregivers', views.CaregiverViewSet)
router.register(r'pregnant-women', views.PregnantWomanViewSet)
router.register(r'experiences', views.CaregiverExperienceViewSet)
router.register(r'verification', views.IDVerificationViewSet, basename='verification')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login_view, name='login'),
    path('register/', views.UserViewSet.as_view({'post': 'create'}), name='register'),
]
