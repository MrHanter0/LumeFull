// catalog.js
let selectedProduct = null;

function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    container.innerHTML = '';

    products.forEach(product => {
        const hasDiscount = product.oldPrice !== null;
        const priceHTML = hasDiscount
            ? `${product.price.toLocaleString('ru-RU')} ₽ <span class="old-price">${product.oldPrice.toLocaleString('ru-RU')} ₽</span>`
            : `${product.price.toLocaleString('ru-RU')} ₽`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="product-price">${priceHTML}</div>
                <a href="#" class="btn btn-outline" data-id="${product.id}">В корзину</a>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.btn-outline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const product = PRODUCTS.find(p => p.id === id);
            if (product) {
                openProductModal(product);
            }
        });
    });
}

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

document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

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

// Фильтрация
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        const filtered = category === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === category);
        renderProducts(filtered);
    });
});

// Поиск из URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        const filtered = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        renderProducts(filtered);
    } else {
        renderProducts(PRODUCTS);
    }
});