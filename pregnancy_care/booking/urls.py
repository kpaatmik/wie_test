from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, UpcomingAppointmentsView

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('appointments/upcoming/', UpcomingAppointmentsView.as_view(), name='upcoming-appointments'),
]
