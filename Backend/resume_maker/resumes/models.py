from django.db import models
from accounts.models import User

# Create your models here.

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    summary = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
class PersonalInfo(models.Model):
    resume = models.OneToOneField(Resume,on_delete=models.CASCADE,related_name="personal")
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    linkedin = models.URLField(blank=True,null=True)
    github = models.URLField(blank=True,null=True)
    
    def __str__(self):
        return f"Personal info of {self.resume.title} ({self.resume.user.username})"
    
class Education(models.Model):
    resume = models.ForeignKey(Resume,on_delete=models.CASCADE,related_name="education")
    institute = models.CharField(max_length=200, null=True, blank=True)
    degree = models.CharField(max_length=200, null=True, blank=True)
    start_year = models.IntegerField(null=True, blank=True)
    end_year = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.degree} at {self.institute} ({self.start_year} - {self.end_year})"

class Experience(models.Model):
    resume = models.ForeignKey(Resume,on_delete=models.CASCADE,related_name="experience")
    company = models.CharField(max_length=200, null=True, blank=True)
    role = models.CharField(max_length=200, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True,blank=True)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.role} at {self.company}"
    
class Skill(models.Model):
    resume = models.ForeignKey(Resume,on_delete=models.CASCADE,related_name="skills")
    name = models.CharField(max_length=900, null=True, blank=True)
    
    def __str__(self):
        return self.name