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
        
    def to_internal_value(self, data):
        int_fields = ['start_year', 'end_year']
        for field in int_fields:
            if data.get(field) == '':
                data[field] = None
        return super().to_internal_value(data)
        
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'role', 'start_date', 'end_date', 'description']
        
    def to_internal_value(self, data):
        date_fields = ['start_date', 'end_date']
        for field in date_fields:
            if data.get(field) == '':
                data[field] = None
        return super().to_internal(data)
        
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']
        
class ResumeSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer()
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    
    class Meta:
        model = Resume
        fields = ['id', 'user', 'title', 'created_at', 'updated_at', 'personal', 'education', 'experience', 'skills', 'summary']
        
        
    def create(self, validated_data):
        personal_data = validated_data.pop("personal", None)
        education_data = validated_data.pop("education", [])
        experience_data = validated_data.pop("experience", [])
        skills_data = validated_data.pop("skills", [])

        resume = Resume.objects.create(user = self.context['request'].user, **validated_data)

        PersonalInfo.objects.create(resume=resume, **personal_data)
        
        education = Education.objects.bulk_create([
            Resume(resume=resume, **edu)
            for edu in education_data
        ])
        
        experience = Experience.objects.bulk_create([
            Experience(resume=resume, **exp)
            for exp in experience_data
        ])
        
        skills = Skill.objects.bulk_create([
            Skill(resume=resume, **skill)
            for skill in skills_data
        ])
        
        return resume
    
    
    def update(self, instance, validated_data):
        personal_data = validated_data.pop('personal')
        education_data = validated_data.pop('education')
        experience_data = validated_data.pop('experience')
        skills_data = validated_data.pop('skills_data')
        
        instance.title = validated_data.get('title', instance.title)
        instance.summary = validated_data.get('summary', instance.summary)
        instance.save()
        
        PersonalInfo.objects.update_or_create(
            resume=instance,
            defaults=personal_data
        )
        
        instance.education.all().delete()
        instance.skills.all().delete()
        instance.experience.all().delete()
        
        Education.objects.bulk_create([
            Education(resume=instance, **edu) for edu in education_data
        ])
        
        Experience.objects.bulk_create([
            Experience(resume=instance, **exp)
            for exp in experience_data
        ])
        
        Skill.objects.bulk_create([
            Skill(resume=instance, **skill)
            for skill in skills_data
        ])
        
        return instance