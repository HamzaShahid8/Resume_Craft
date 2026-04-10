from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'image'
        ]
    
    def create(self, validated_data):
        
        user = User.objects.create_user(
            username = validated_data.get('username'),
            email = validated_data.get('email'),
            image = validated_data.get('image')
        )
        user.set_password(validated_data['password'])
        user.save()
        
        send_mail(
            subject = "Welcome to Resume Craft",
            message = f"Hi {user.username}, your account has been created successfully.",
            from_email = None,
            recipient_list = [user.email],
            fail_silently = False,
        )
        
        return user
    
class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data 