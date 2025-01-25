"""
pregnancy_care URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include('account.urls')),
    path('booking/', include('booking.urls')),
    path('sessions/', include('expert_sessions.urls')),
    path('social/', include('social.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
