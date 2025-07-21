from django.db import models
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser,PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_user(self,username,email,password = None, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email = email,
                          username = username,
                          **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self,username,email,password =  None, **extra_fields):

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not None:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not None:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username,email, password, **extra_fields)
    
class CustomUser(AbstractBaseUser,PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] 

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions',
        blank=True,
    )
    def __str__(self):
        return self.email
    
class Note(models.Model):
    user        = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="notes"
    )
    title       = models.CharField(max_length=255)
    description = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]       

    def __str__(self) -> str:
        return self.title