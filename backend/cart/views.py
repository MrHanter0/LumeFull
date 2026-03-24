from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer


def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AddToCartSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        cart = get_or_create_cart(request)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({
            'success': True,
            'cart_total': cart.total_items,
            'message': f'Товар "{product.name}" добавлен в корзину'
        }, status=status.HTTP_201_CREATED)


class RemoveFromCartView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, item_id):
        cart = get_or_create_cart(request)
        cart_item = CartItem.objects.filter(id=item_id, cart=cart).first()

        if not cart_item:
            return Response({'error': 'Товар в корзине не найден'}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response({'success': True})