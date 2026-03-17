const ROUTES = {
    home: '/',
    cart: '/cart/',
    login: '/login/'
};

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    const cartContent = document.getElementById('cartContent');

    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <p>Ваша корзина пуста</p>
                <a href="${ROUTES.home}" class="continue-shopping">Продолжить покупки</a>
            </div>
        `;
        return;
    }

    let itemsHtml = '<div class="cart-items">';

    cart.forEach(item => {
        itemsHtml += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div>
                        <span class="cart-item-category">${item.category}</span>
                        <h3>${item.name}</h3>
                        <div>Размер: ${item.size}</div>
                        <div>Цвет: ${item.color}</div>
                        <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    itemsHtml += '</div>';

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    itemsHtml += `
        <div class="cart-summary">
            <h3>Итого</h3>
            <div class="summary-row">
                <span>Товары (${count} шт.):</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="total-row">
                <span>Итого:</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button class="checkout-btn" id="checkoutBtn">Оформить заказ</button>
            <a href="${ROUTES.home}" class="continue-shopping">Продолжить покупки</a>
        </div>
    `;

    cartContent.innerHTML = itemsHtml;

    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });

    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        const user = localStorage.getItem('lume_current_user');

        if (!user) {
            alert('Для оформления заказа нужно войти в аккаунт.');
            window.location.href = ROUTES.login;
            return;
        }

        alert('Заказ оформлен условно. Это учебная версия проекта.');
    });

    updateCartCounter();
}

function updateQuantity(id, change) {
    let cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }

        localStorage.setItem('lume_cart', JSON.stringify(cart));
        updateCartCounter();
        loadCart();
    }
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('lume_cart', JSON.stringify(cart));
    updateCartCounter();
    loadCart();
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counter = document.querySelector('.cart-counter');

    if (counter) {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadCart);