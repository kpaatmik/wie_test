from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'experts', views.ExpertViewSet)
router.register(r'sessions', views.SessionViewSet)
router.register(r'bookings', views.SessionBookingViewSet)
router.register(r'appointments', views.AppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
