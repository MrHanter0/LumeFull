from rest_framework import serializers
from .models import User
import re

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'password', 'role', 'created_at']
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Пароль должен быть минимум 8 символов")
        return value
    
    def validate_email(self, value):
        if '@' not in value:
            raise serializers.ValidationError("Email должен содержать символ @")
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()