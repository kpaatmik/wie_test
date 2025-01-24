from django.contrib import admin
from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience
# Register your models here.
admin.site.register(Caregiver)
admin.site.register(PregnantWoman)
admin.site.register(CaregiverExperience)
admin.site.register(CaregiverReview)

