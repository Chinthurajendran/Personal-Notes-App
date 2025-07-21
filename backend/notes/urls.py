from django.urls import path
from .views import*

urlpatterns = [
    path('register', Register.as_view()),
    path('login', LoginView.as_view(),name="login"),
    path("user_refresh_token/", UserRefreshTokenView.as_view(), name="refresh"),
    path("NoteCreate/<int:id>/", NoteCreate.as_view(), name="note-create"),
    path("FetchNote/<int:id>/", FetchNote.as_view(), name="note-fetch"),
    path("DeleteNote/<int:id>/", DeleteNote.as_view(), name="note-delete"),
    path('UpdateNote/<int:id>/', UpdateNote.as_view(), name='update-note'),
]