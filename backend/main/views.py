from django.shortcuts import render, redirect
from products.models import Product, Category

def home(request):
    products = Product.objects.filter(available=True)[:8]
    return render(request, 'main/index.html', {'products': products})

def catalog(request):
    products = Product.objects.filter(available=True)
    categories = Category.objects.all()
    return render(request, 'main/catalog.html', {'products': products, 'categories': categories})

def about(request):
    return redirect('/')

def cart(request):
    return render(request, 'main/cart.html')

def login(request):
    return render(request, 'accounts/login.html')

def register(request):
    return render(request, 'accounts/register.html')