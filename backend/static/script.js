const ROUTES = {
    home: '/',
    catalog: '/catalog/',
    cart: '/cart/',
    login: '/login/',
    register: '/register/'
};

function getCart() {
    return JSON.parse(localStorage.getItem('lume_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('lume_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelectorAll('.fa-shopping-bag').forEach(icon => {
        const link = icon.closest('a');
        if (!link) return;

        let counter = link.querySelector('.cart-counter');
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
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
            });
            link.style.position = 'relative';
            link.appendChild(counter);
        }

        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    });
}

function addToCartFromButton(button) {
    const productId = String(button.dataset.id);
    const productName = button.dataset.name;
    const productCategory = button.dataset.category;
    const productPrice = parseFloat(button.dataset.price);
    const productImage = button.dataset.image || '';

    let cart = getCart();
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            category: productCategory,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCounter();
    alert(`Товар "${productName}" добавлен в корзину`);
}

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

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            addToCartFromButton(button);
        });
    });

    const cartIcon = document.querySelector('.fa-shopping-bag')?.closest('a');
    const userIcon = document.querySelector('.fa-user')?.closest('a');
    const searchIcon = document.querySelector('.fa-search')?.closest('a');

    if (cartIcon) {
        cartIcon.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = ROUTES.cart;
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', e => {
            e.preventDefault();
            const query = prompt('Введите название товара:');
            if (query !== null) {
                window.location.href = `${ROUTES.catalog}?q=${encodeURIComponent(query)}`;
            }
        });
    }

    if (userIcon) {
        userIcon.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = ROUTES.login;
        });
    }

    updateCartCounter();
});