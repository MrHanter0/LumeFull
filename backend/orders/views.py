from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from products.models import Product
from accounts.permissions import IsCustomerOrAdmin


class OrderCreateView(APIView):
    permission_classes = [IsCustomerOrAdmin]

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

            if not product_id or quantity < 1:
                return Response(
                    {'error': 'Каждый элемент заказа должен содержать product_id и quantity >= 1'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {'error': f'Товар с id={product_id} не найден'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if not product.available or product.stock < quantity:
                return Response(
                    {'error': f'Товар "{product.name}" недоступен в количестве {quantity}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            total_price += product.price * quantity
            order_items.append({
                'product': product,
                'quantity': quantity,
                'price': product.price,
            })

        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            shipping_address=serializer.validated_data.get('shipping_address', ''),
            phone=serializer.validated_data.get('phone', ''),
        )

        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                price=item['price'],
            )
            item['product'].stock -= item['quantity']
            item['product'].save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsCustomerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.prefetch_related('items__product').all()
        return Order.objects.prefetch_related('items__product').filter(user=user)


class MyOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.prefetch_related('items__product').filter(user=self.request.user)
