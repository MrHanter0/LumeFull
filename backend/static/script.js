let selectedProduct = null;

const ROUTES = {
    home: '/',
    catalog: '/catalog/',
    cart: '/cart/',
    login: '/login/',
    register: '/register/'
};

document.addEventListener('DOMContentLoaded', () => {
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
            if (mobileMenuBtn) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    function openProductModal(product) {
        selectedProduct = { ...product };

        const modal = document.getElementById('productModal');
        const modalProductName = document.getElementById('modalProductName');
        const modalProductImage = document.getElementById('modalProductImage');
        const sizeContainer = document.getElementById('sizeOptions');
        const colorContainer = document.getElementById('colorOptions');

        if (!modal || !modalProductName || !modalProductImage || !sizeContainer || !colorContainer) {
            alert('Модальное окно товара не найдено.');
            return;
        }

        modalProductName.textContent = product.name;
        modalProductImage.src = product.image;
        modalProductImage.alt = product.name;

        sizeContainer.innerHTML = '';
        colorContainer.innerHTML = '';

        product.options.sizes.forEach(size => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = size;
            btn.style.margin = '5px';
            btn.style.padding = '8px 12px';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', () => {
                document.querySelectorAll('#sizeOptions button').forEach(b => {
                    b.style.background = '';
                    b.style.color = '';
                });
                btn.style.background = 'var(--accent-gold)';
                btn.style.color = 'var(--primary-dark)';
                selectedProduct.selectedSize = size;
            });

            sizeContainer.appendChild(btn);
        });

        product.options.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = color;
            btn.style.margin = '5px';
            btn.style.padding = '8px 12px';
            btn.style.border = '1px solid #ddd';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', () => {
                document.querySelectorAll('#colorOptions button').forEach(b => {
                    b.style.background = '';
                    b.style.color = '';
                });
                btn.style.background = 'var(--accent-gold)';
                btn.style.color = 'var(--primary-dark)';
                selectedProduct.selectedColor = color;
            });

            colorContainer.appendChild(btn);
        });

        selectedProduct.selectedSize = product.options.sizes[0];
        selectedProduct.selectedColor = product.options.colors[0];

        const firstSizeBtn = document.querySelector('#sizeOptions button');
        const firstColorBtn = document.querySelector('#colorOptions button');

        if (firstSizeBtn) {
            firstSizeBtn.style.background = 'var(--accent-gold)';
            firstSizeBtn.style.color = 'var(--primary-dark)';
        }

        if (firstColorBtn) {
            firstColorBtn.style.background = 'var(--accent-gold)';
            firstColorBtn.style.color = 'var(--primary-dark)';
        }

        modal.style.display = 'flex';
    }

    document.querySelectorAll('.product-card .btn-outline').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const card = this.closest('.product-card');
            if (!card) return;

            const title = card.querySelector('.product-info h3');
            if (!title) return;

            const name = title.textContent.trim();
            const product = typeof PRODUCTS !== 'undefined'
                ? PRODUCTS.find(p => p.name.trim() === name)
                : null;

            if (!product) {
                alert(`Товар "${name}" не найден в data.js`);
                return;
            }

            openProductModal(product);
        });
    });

    document.getElementById('closeModal')?.addEventListener('click', () => {
        const modal = document.getElementById('productModal');
        if (modal) modal.style.display = 'none';
    });

    document.getElementById('addToCartFromModal')?.addEventListener('click', () => {
        if (!selectedProduct || !selectedProduct.selectedSize || !selectedProduct.selectedColor) {
            alert('Выберите размер и цвет');
            return;
        }

        const quantityInput = document.getElementById('quantityInput');
        const quantity = parseInt(quantityInput?.value, 10) || 1;

        const fullId = `${selectedProduct.id}__${selectedProduct.selectedSize}__${selectedProduct.selectedColor}`;

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

        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const counter = document.querySelector('.cart-counter');

        if (counter) {
            counter.textContent = count;
            counter.style.display = count > 0 ? 'flex' : 'flex';
        }

        alert(`Товар добавлен!\n${cartItem.name}\nРазмер: ${cartItem.size}, Цвет: ${cartItem.color}`);

        const modal = document.getElementById('productModal');
        if (modal) modal.style.display = 'none';
    });

    const cartIcon = document.querySelector('.fa-shopping-bag')?.closest('a');
    const userIcon = document.querySelector('.fa-user')?.closest('a');
    const searchIcon = document.querySelector('.fa-search')?.closest('a');

    if (cartIcon) {
        let counter = cartIcon.querySelector('.cart-counter');

        if (!counter) {
            counter = document.createElement('span');
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
        }

        const savedCart = JSON.parse(localStorage.getItem('lume_cart') || '[]');
        const initialCount = savedCart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = initialCount;
        counter.style.display = initialCount > 0 ? 'flex' : 'none';

        cartIcon.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = ROUTES.cart;
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', e => {
            e.preventDefault();
            const query = prompt('Введите название товара:');
            if (query) {
                window.location.href = `${ROUTES.catalog}?q=${encodeURIComponent(query)}`;
            }
        });
    }

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
                window.location.href = ROUTES.login;
            }
        });
    }
});