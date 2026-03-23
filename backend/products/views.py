from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from rest_framework import generics, permissions, filters
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from accounts.permissions import IsAdminUserRole


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['price', 'name', 'created']
    ordering = ['-created']

    def get_queryset(self):
        queryset = Product.objects.select_related('category').all()

        if not self.request.user.is_authenticated or getattr(self.request.user, 'role', None) != 'admin':
            queryset = queryset.filter(available=True)

        category_slug = self.request.query_params.get('category')
        query = self.request.query_params.get('q')

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query)
            )

        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        queryset = Product.objects.select_related('category').all()
        if not self.request.user.is_authenticated or getattr(self.request.user, 'role', None) != 'admin':
            queryset = queryset.filter(available=True)
        return queryset

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


def catalog_view(request):
    products = Product.objects.filter(available=True).select_related('category')
    category_slug = request.GET.get('category')
    query = request.GET.get('q')

    if category_slug:
        products = products.filter(category__slug=category_slug)

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    sort_by = request.GET.get('sort', 'name')
    if sort_by == 'price_asc':
        products = products.order_by('price')
    elif sort_by == 'price_desc':
        products = products.order_by('-price')
    elif sort_by == 'new':
        products = products.order_by('-created')
    else:
        products = products.order_by('name')

    context = {
        'products': products,
        'categories': Category.objects.all(),
        'current_query': query or '',
        'current_category': category_slug or '',
        'current_sort': sort_by,
    }
    return render(request, 'main/catalog.html', context)


def product_detail(request, slug):
    product = get_object_or_404(Product.objects.select_related('category'), slug=slug, available=True)
    related_products = Product.objects.filter(
        available=True,
        category=product.category
    ).exclude(id=product.id)[:4]

    return render(request, 'main/product_detail.html', {
        'product': product,
        'related_products': related_products
    })


def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)
    products = Product.objects.filter(category=category, available=True)

    return render(request, 'main/catalog.html', {
        'category': category,
        'products': products,
        'categories': Category.objects.all(),
        'current_category': category.slug,
        'current_query': '',
        'current_sort': 'name',
    })