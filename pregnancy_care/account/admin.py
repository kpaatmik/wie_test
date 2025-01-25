from django.contrib import admin
from .models import User, PregnantWoman, Caregiver, CaregiverReview, CaregiverExperience, IDVerification

# Register your existing models
admin.site.register(Caregiver)
admin.site.register(PregnantWoman)
admin.site.register(CaregiverExperience)
admin.site.register(CaregiverReview)

@admin.register(IDVerification)
class IDVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_type', 'verification_status', 'submission_date', 'is_verified')
    list_filter = ('verification_status', 'id_type', 'submission_date', 'is_verified')
    search_fields = ('user__username', 'user__email', 'id_number')
    readonly_fields = ('submission_date',)
    
    def save_model(self, request, obj, form, change):
        if 'verification_status' in form.changed_data:
            if obj.verification_status == 'approved':
                obj.is_verified = True
            else:
                obj.is_verified = False
        super().save_model(request, obj, form, change)
