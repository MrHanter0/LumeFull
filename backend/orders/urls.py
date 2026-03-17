from django.urls import path
from .views import OrderCreateView, OrderListView, MyOrderListView

urlpatterns = [
    path('create/', OrderCreateView.as_view(), name='order_create'),
    path('', OrderListView.as_view(), name='order_list'),
    path('my/', MyOrderListView.as_view(), name='my_orders'),
]