from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('catalog/', views.catalog, name='catalog'),
    path('about/', views.about, name='about'),
    path('cart/', views.cart, name='cart'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
]