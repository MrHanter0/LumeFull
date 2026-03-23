function getCart() {
    return JSON.parse(localStorage.getItem('lume_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('lume_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const counters = document.querySelectorAll('.cart-counter');

    counters.forEach(counter => {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    });
}

function loadCart() {
    const cart = getCart();
    const cartContent = document.getElementById('cartContent');

    if (!cartContent) return;

    if (!cart.length) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <p>Ваша корзина пуста</p>
                <a href="/catalog/" class="continue-shopping">Перейти в каталог</a>
            </div>
        `;
        updateCartCounter();
        return;
    }

    let html = '<div class="cart-items">';

    cart.forEach(item => {
        const itemPrice = Number(item.price || 0);
        const itemQuantity = Number(item.quantity || 1);
        const itemTotal = itemPrice * itemQuantity;

        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-img">
                    <img src="${item.image || 'https://via.placeholder.com/400x500?text=No+Image'}" alt="${item.name}">
                </div>

                <div class="cart-item-info">
                    <div>
                        <span class="cart-item-category">${item.category || 'Без категории'}</span>
                        <h3>${item.name || 'Товар'}</h3>
                        <div class="cart-item-price">${itemPrice.toLocaleString('ru-RU')} ₽</div>
                        <div style="margin-top:8px;color:#666;">Сумма: ${itemTotal.toLocaleString('ru-RU')} ₽</div>
                    </div>

                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">−</button>
                        <span class="quantity-display">${itemQuantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    const totalCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalPrice = cart.reduce((sum, item) => {
        return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);

    html += `
        <div class="cart-summary">
            <h3>Итого</h3>
            <div class="summary-row">
                <span>Товаров:</span>
                <span>${totalCount}</span>
            </div>
            <div class="total-row">
                <span>К оплате:</span>
                <span>${totalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button class="checkout-btn" id="checkoutBtn">Оформить заказ</button>
            <a href="/catalog/" class="continue-shopping">Продолжить покупки</a>
        </div>
    `;

    cartContent.innerHTML = html;

    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });

    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', createOrderFromCart);

    updateCartCounter();
}

function updateQuantity(id, change) {
    const cart = getCart();
    const item = cart.find(i => String(i.id) === String(id));

    if (!item) return;

    item.quantity = Number(item.quantity || 1) + change;

    let updatedCart = cart;
    if (item.quantity <= 0) {
        updatedCart = cart.filter(i => String(i.id) !== String(id));
    }

    saveCart(updatedCart);
    loadCart();
}

function removeItem(id) {
    const cart = getCart().filter(i => String(i.id) !== String(id));
    saveCart(cart);
    loadCart();
}

async function createOrderFromCart() {
    const accessToken = localStorage.getItem('lume_access_token');
    const currentUser = localStorage.getItem('lume_current_user');
    const cart = getCart();

    if (!accessToken || !currentUser) {
        alert('Для оформления заказа нужно войти в аккаунт.');
        window.location.href = '/login/';
        return;
    }

    if (!cart.length) {
        alert('Корзина пуста.');
        return;
    }

    const items = cart.map(item => ({
        product_id: Number(item.id),
        quantity: Number(item.quantity || 1)
    }));

    const shipping_address = prompt('Введите адрес доставки:', 'Москва, ул. Пример, 1');
    if (shipping_address === null) return;

    const phone = prompt('Введите номер телефона:', '+79999999999');
    if (phone === null) return;

    try {
        const response = await fetch('/api/orders/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                items,
                shipping_address,
                phone
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || JSON.stringify(data));
            return;
        }

        alert(`Заказ #${data.id} успешно создан`);
        localStorage.removeItem('lume_cart');
        loadCart();
    } catch (error) {
        console.error(error);
        alert('Не удалось оформить заказ.');
    }
}

document.addEventListener('DOMContentLoaded', loadCart);