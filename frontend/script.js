// script.js — обновлённая версия с поддержкой опций и модалки
let selectedProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.innerHTML = nav.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav) nav.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === МОДАЛЬНОЕ ОКНО И КОРЗИНА ===
    function openProductModal(product) {
        selectedProduct = product;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductImage').src = product.image;

        const sizeContainer = document.getElementById('sizeOptions');
        sizeContainer.innerHTML = '';
        product.options.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.textContent = size;
            btn.style.margin = '5px';
            btn.style.padding = '8px 12px';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                document.querySelectorAll('#sizeOptions button').forEach(b => b.style.background = '');
                btn.style.background = 'var(--accent-gold)';
                btn.style.color = 'var(--primary-dark)';
                selectedProduct.selectedSize = size;
            };
            sizeContainer.appendChild(btn);
        });

        const colorContainer = document.getElementById('colorOptions');
        colorContainer.innerHTML = '';
        product.options.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.textContent = color;
            btn.style.margin = '5px';
            btn.style.padding = '8px 12px';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                document.querySelectorAll('#colorOptions button').forEach(b => b.style.background = '');
                btn.style.background = 'var(--accent-gold)';
                btn.style.color = 'var(--primary-dark)';
                selectedProduct.selectedColor = color;
            };
            colorContainer.appendChild(btn);
        });

        selectedProduct.selectedSize = product.options.sizes[0];
        selectedProduct.selectedColor = product.options.colors[0];
        const firstSizeBtn = document.querySelector('#sizeOptions button');
        const firstColorBtn = document.querySelector('#colorOptions button');
        if (firstSizeBtn) firstSizeBtn.style.background = 'var(--accent-gold)';
        if (firstSizeBtn) firstSizeBtn.style.color = 'var(--primary-dark)';
        if (firstColorBtn) firstColorBtn.style.background = 'var(--accent-gold)';
        if (firstColorBtn) firstColorBtn.style.color = 'var(--primary-dark)';

        document.getElementById('productModal').style.display = 'flex';
    }

    // Кнопки "В корзину" на главной
    document.querySelectorAll('.btn-outline').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const name = card.querySelector('.product-info h3').textContent.trim();
            const product = PRODUCTS.find(p => p.name === name);
            if (product) {
                openProductModal(product);
            }
        });
    });

    // Закрытие модалки
    document.getElementById('closeModal')?.addEventListener('click', () => {
        document.getElementById('productModal').style.display = 'none';
    });

    // Добавление из модалки
    document.getElementById('addToCartFromModal')?.addEventListener('click', () => {
        if (!selectedProduct || !selectedProduct.selectedSize || !selectedProduct.selectedColor) {
            alert('Выберите размер и цвет');
            return;
        }

        const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
        const fullId = btoa(`${selectedProduct.id}-${selectedProduct.selectedSize}-${selectedProduct.selectedColor}`);

        const cartItem = {
            id: fullId,
            name: selectedProduct.name,
            category: selectedProduct.category,
            price: selectedProduct.price,
            image: selectedProduct.image,
            size: selectedProduct.selectedSize,
            color: selectedProduct.selectedColor,
            quantity: quantity
        };

        let cart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
        const existing = cart.find(item => item.id === fullId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push(cartItem);
        }
        localStorage.setItem('lume_cart', JSON.stringify(cart));

        if (typeof updateCartCounterUI === 'function') {
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            updateCartCounterUI(count);
        }

        alert(`Товар добавлен!\n${cartItem.name}\nРазмер: ${cartItem.size}, Цвет: ${cartItem.color}`);
        document.getElementById('productModal').style.display = 'none';
    });

    // === ИКОНКИ В ШАПКЕ ===
    const cartIcon = document.querySelector('.fa-shopping-bag')?.closest('a');
    const userIcon = document.querySelector('.fa-user')?.closest('a');
    const searchIcon = document.querySelector('.fa-search')?.closest('a');

    // Корзина
    if (cartIcon) {
        const counter = document.createElement('span');
        counter.className = 'cart-counter';
        Object.assign(counter.style, {
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: 'var(--accent-gold)',
            color: 'var(--primary-dark)',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        });
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(counter);

        window.updateCartCounterUI = function(count) {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'flex' : 'none';
        };

        const savedCart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
        const initialCount = savedCart.reduce((sum, item) => sum + item.quantity, 0);
        updateCartCounterUI(initialCount);

        cartIcon.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }

    // Поиск
    if (searchIcon) {
        searchIcon.addEventListener('click', e => {
            e.preventDefault();
            const query = prompt('Введите название товара:');
            if (query) {
                window.location.href = `catalog.html?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // Профиль
    if (userIcon) {
        userIcon.addEventListener('click', e => {
            e.preventDefault();
            const user = localStorage.getItem('lume_current_user');
            if (user) {
                if (confirm(`Вы вошли как: ${user}\n\nВыйти?`)) {
                    localStorage.removeItem('lume_current_user');
                    alert('Вы вышли из аккаунта.');
                    location.reload();
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    }
});