from django.urls import path
from .views import ProductListCreateView, ProductDetailView, CategoryListView
from . import views

app_name = 'products'

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product_list'),
    path('create/', ProductListCreateView.as_view(), name='product_create'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail_api'),

    path('catalog/', views.catalog_view, name='catalog'),
    path('category/<slug:slug>/', views.category_detail, name='category_detail'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail_page'),
]