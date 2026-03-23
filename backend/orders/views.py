from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from products.models import Product
from accounts.permissions import IsCustomerOrAdmin, IsAdminUserRole


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items_data = serializer.validated_data['items']
        total_price = 0
        order_items = []

        for item in items_data:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)

            if not product_id:
                return Response(
                    {'error': 'product_id обязателен'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            product = get_object_or_404(Product, id=product_id)

            if not product.available or product.stock < quantity:
                return Response(
                    {'error': f'Товар "{product.name}" недоступен в количестве {quantity}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            total_price += product.price * quantity
            order_items.append({
                'product': product,
                'quantity': quantity,
                'price': product.price
            })

        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            shipping_address=serializer.validated_data.get('shipping_address', ''),
            phone=serializer.validated_data.get('phone', '')
        )

        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['price']
            )
            item['product'].stock -= item['quantity']
            item['product'].save(update_fields=['stock'])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            return Order.objects.prefetch_related('items__product').select_related('user').all().order_by('-created_at')
        return Order.objects.prefetch_related('items__product').select_related('user').filter(user=user).order_by('-created_at')


class MyOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.prefetch_related('items__product').select_related('user').filter(
            user=self.request.user
        ).order_by('-created_at')