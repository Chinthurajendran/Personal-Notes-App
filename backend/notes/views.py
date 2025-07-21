from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework import permissions, status
from .serializers import *
from .models import *
from rest_framework.exceptions import AuthenticationFailed, ParseError
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .auth_backends import RefreshTokenAuth

# def get_tokens_for_user(user):
#     refresh = RefreshToken.for_user(user)
#     return {
#         'refresh': str(refresh),
#         'access': str(refresh.access_token),
#     }

class Register(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            if CustomUser.objects.filter(email=serializer.validated_data['email']).exists():
                return Response({"error": "This email is already registered. Please use a different email."},
                                status=status.HTTP_403_FORBIDDEN)
            else:
                user = CustomUser.objects.create(
                    email=serializer.validated_data['email'],
                    username=serializer.validated_data['username'],
                )
                user.set_password(serializer.validated_data['password'])
                user.save()

                return Response({"message": "Registration successful! Welcome aboard!"},
                                status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self,request):
        email = request.data['email']
        password = request.data['password']

        if not CustomUser.objects.filter(email = email).exists():
            raise AuthenticationFailed('Invalid Email Address')
        
        user = authenticate(request, username=email, password=password)
    
        if user is None:
            raise AuthenticationFailed('Invalid Password')
        
        login(request, user)

        refresh = RefreshToken.for_user(user)
        refresh['username'] = str(user.username)
        content = {
            'user_refresh_token': str(refresh),
            'user_access_token': str(refresh.access_token),
            'user_id': user.id,
        }

        return Response(content, status=status.HTTP_200_OK)

class UserRefreshTokenView(APIView):

    authentication_classes = [RefreshTokenAuth] 
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.auth            
        new_access   = refresh_token.access_token
        return Response({"access_token": str(new_access)})


class NoteCreate(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        serializer = NotesSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = CustomUser.objects.get(id=id)
            except CustomUser.DoesNotExist:
                return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            Note.objects.create(
                user=user,
                title=serializer.validated_data['title'],
                description=serializer.validated_data['description']
            )
            return Response({"detail": "Note created successfully"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class FetchNote(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        try:
            user = CustomUser.objects.get(id=id)
            notes = Note.objects.filter(user_id=user)
            serializer = NotesSerializer(notes, many=True)
            return Response({"Notes": serializer.data}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        

class DeleteNote(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        try:
            notes = Note.objects.filter(id=id)
            notes.delete()
            return Response(status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateNote(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            note = Note.objects.get(id=id, user=request.user)
        except Note.DoesNotExist:
            return Response({"detail": "Note not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = NotesSerializer(note, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)