from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'accounts': {
            'register': '/api/accounts/register/',
            'login': '/api/accounts/login/',
            'refresh': '/api/accounts/token/refresh/',
            'profile': '/api/accounts/profile/',
        },
        'products': {
            'list': '/api/products/',
            'create': '/api/products/create/',
            'categories': '/api/products/categories/',
            'detail_example': '/api/products/1/',
        },
        'orders': {
            'create': '/api/orders/create/',
            'list': '/api/orders/',
            'my_orders': '/api/orders/my/',
        },
        'cart': {
            'current': '/api/cart/',
            'add': '/api/cart/add/',
            'remove_example': '/api/cart/remove/1/',
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/accounts/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/cart/', include('cart.urls')),
    path('', include('main.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)