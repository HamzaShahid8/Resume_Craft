from django.urls import path, include
from .models import *
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('resume', ResumeViewSet, basename='resume')
router.register('personal', PersonalInfoViewSet, basename='personal')
router.register('education', EducationViewSet, basename='education')
router.register('experience', ExperienceViewSet, basename='experience')
router.register('skill', SkillViewSet, basename='skill')
router.register('history', ResumeHistoryViewSet, basename='history')

urlpatterns = [
    path('', include(router.urls)),
    path('resumes/<int:id>/pdf/', ResumePDFView.as_view(), name='resume-pdf'),
]