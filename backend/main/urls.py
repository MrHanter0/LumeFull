from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('catalog/', views.catalog, name='catalog'),
    path('product/<int:product_id>/', views.product_detail, name='product_detail'),
    path('profile/', views.profile, name='profile'),
    path('about/', views.about, name='about'),
    path('cart/', views.cart, name='cart'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
]