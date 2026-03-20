from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from products.models import Product, Category


def home(request):
    products = Product.objects.filter(available=True).select_related('category').order_by('-created')[:8]
    categories = Category.objects.all()
    return render(request, 'main/index.html', {
        'products': products,
        'categories': categories,
    })


def catalog(request):
    products = Product.objects.filter(available=True).select_related('category').order_by('-created')
    categories = Category.objects.all()

    category_slug = request.GET.get('category')
    query = request.GET.get('q', '').strip()
    sort = request.GET.get('sort', 'new')

    if category_slug:
        products = products.filter(category__slug=category_slug)

    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )

    if sort == 'price_asc':
        products = products.order_by('price')
    elif sort == 'price_desc':
        products = products.order_by('-price')
    elif sort == 'name':
        products = products.order_by('name')
    else:
        products = products.order_by('-created')

    return render(request, 'main/catalog.html', {
        'products': products,
        'categories': categories,
        'current_category': category_slug or '',
        'current_query': query,
        'current_sort': sort,
    })


def product_detail(request, product_id):
    product = get_object_or_404(
        Product.objects.select_related('category'),
        id=product_id,
        available=True
    )

    related_products = Product.objects.filter(
        available=True,
        category=product.category
    ).exclude(id=product.id).order_by('-created')[:4]

    return render(request, 'main/product_detail.html', {
        'product': product,
        'related_products': related_products,
    })


def about(request):
    return redirect('/')


def cart(request):
    return render(request, 'main/cart.html')


def login(request):
    return render(request, 'accounts/login.html')


def register(request):
    return render(request, 'accounts/register.html')