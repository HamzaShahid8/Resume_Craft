from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView

# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
class LoginView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        return Response({
            'username': user.username,
            'email': user.email,
            'password': user.password
        }
        )
    
    def patch(self, request):
        user = request.user
        
        user.username = request.data.get('username', user.username)
        user.email = request.data.get('email', user.email)
        if 'image' in request.data:
            user.image = request.data.get('image', user.image)
        user.save()
        return Response({'message': 'Profile updated successfully'})

        
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if not user.check_password(request.data['old_password']):
            return Response({'error': 'Wrong password'})
        
        user.set_password(request.data['new_password'])
        user.save()
        return Response({'messsage': "Password Updated"})
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout Successfull'})
        except Exception:
            return Response({'error': 'Invalid token'})