from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'caregivers', views.CaregiverViewSet)
router.register(r'pregnant-women', views.PregnantWomanViewSet)
router.register(r'experiences', views.CaregiverExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('register/', views.UserViewSet.as_view({'post': 'create'}), name='user_register'),
]
