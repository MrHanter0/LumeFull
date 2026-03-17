from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product
import json

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        product = Product.objects.get(id=product_id, available=True)
        cart = get_or_create_cart(request)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({
            'success': True,
            'cart_total': cart.total_items,
            'message': f'Товар "{product.name}" добавлен в корзину'
        })

class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def post(self, request, item_id):
        cart_item = CartItem.objects.get(id=item_id)
        cart_item.delete()
        return Response({'success': True})