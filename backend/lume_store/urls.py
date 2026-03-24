from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'accounts': {
            'register': reverse('register', request=request, format=format),
            'login': reverse('token_obtain_pair', request=request, format=format),
            'refresh': reverse('token_refresh', request=request, format=format),
            'profile': reverse('user_profile', request=request, format=format),
        },
        'products': {
            'list': reverse('products:product_list', request=request, format=format),
            'create': reverse('products:product_create', request=request, format=format),
            'categories': reverse('products:category_list', request=request, format=format),
            'detail_example': request.build_absolute_uri('/api/products/1/'),
        },
        'orders': {
            'create': reverse('order_create', request=request, format=format),
            'list': reverse('order_list', request=request, format=format),
            'my_orders': reverse('my_orders', request=request, format=format),
        },
        'cart': {
            'current': reverse('cart', request=request, format=format),
            'add': reverse('add_to_cart', request=request, format=format),
            'remove_example': request.build_absolute_uri('/api/cart/remove/1/'),
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