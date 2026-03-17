// cart.js

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <p>Ваша корзина пуста</p>
                <a href="index.html" class="continue-shopping">Продолжить покупки</a>
            </div>
        `;
        return;
    }

    // Формируем HTML товаров
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

    // Считаем итог
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    itemsHtml += `
        <div class="cart-summary">
            <h3>Итого</h3>
            <div class="summary-row">
                <span>Товары (${cart.reduce((sum, item) => sum + item.quantity, 0)} шт.):</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="total-row">
                <span>Итого:</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <button class="checkout-btn" id="checkoutBtn">Оформить заказ</button>
            <a href="index.html" class="continue-shopping">Продолжить покупки</a>
        </div>
    `;

    cartContent.innerHTML = itemsHtml;

    // Обработчики
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
        alert('Оформление заказа пока недоступно.\nЭто MVP-версия.');
    });
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
        updateCartCounter(); // обновить счётчик в шапке (если будет глобальный)
        loadCart(); // перерисовать
    }
}

function removeItem(id) {
    let cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('lume_cart', JSON.stringify(cart));
    updateCartCounter();
    loadCart();
}

// Обновление счётчика корзины (можно вынести в общий файл позже)
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Если страница содержит иконку корзины — обновить её
    const counter = document.querySelector('.cart-counter');
    if (counter) {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Загрузка при старте
document.addEventListener('DOMContentLoaded', loadCart);