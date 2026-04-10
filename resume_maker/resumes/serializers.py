from rest_framework import serializers
from .models import *

class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInfo
        fields = ['id', 'phone', 'address', 'linkedin', 'github']
        
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institute', 'degree', 'start_year', 'end_year']
        
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'role', 'start_date', 'end_date', 'description']
        
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']
        
class ResumeSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer()
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
    skills = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'created_at', 'updated_at', 'personal', 'education', 'experience', 'skills', 'summary']
        
        
    def create(self, validated_data):
        skills_data = validated_data.pop('skills', [])
        resume = Resume.objects.create(**validated_data)
        
        # Create skill objects
        for skill_name in skills_data:
            Skill.objects.create(resume=resume, name=skill_name)
        
        return resume

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', [])
        instance.title = validated_data.get('title', instance.title)
        instance.save()

        # Update skills: delete old, add new
        instance.skills.all().delete()
        for skill_name in skills_data:
            Skill.objects.create(resume=instance, name=skill_name)

        return instance