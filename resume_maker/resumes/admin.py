from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('title', 'user__username', 'user__email')

# Optional: register individual models separately if needed
@admin.register(PersonalInfo)
class PersonalInfoAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume', 'phone', 'address', 'linkedin', 'github')
    search_fields = ('resume__title', 'phone', 'address')

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume', 'degree', 'institute')
    search_fields = ('resume__title', 'degree', 'institute')

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume', 'company', 'role', 'start_date', 'end_date')
    search_fields = ('resume__title', 'company', 'role')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'resume', 'name')
    search_fields = ('resume__title', 'name')