from pathlib import Path

root = Path('.')
targets = []

for base in ('templates', 'static'):
    p = root / base
    if p.exists():
        targets.extend(p.rglob('*.html'))
        targets.extend(p.rglob('*.js'))
        targets.extend(p.rglob('*.css'))

for path in targets:
    text = path.read_text(encoding='utf-8')

    text = text.replace('login.html', '/login/')
    text = text.replace('register.html', '/register/')
    text = text.replace('cart.html', '/cart/')
    text = text.replace('catalog.html', '/catalog/')
    text = text.replace('index.html', '/')

    text = text.replace(
        "const fullId = btoa(`${selectedProduct.id}-${selectedProduct.selectedSize}-${selectedProduct.selectedColor}`);",
        "const fullId = `${selectedProduct.id}__${selectedProduct.selectedSize}__${selectedProduct.selectedColor}`;"
    )

    text = text.replace(
        '<script src="{% static \'script.js\' %}"></script>\n<script src="{% static \'script.js\' %}"></script>',
        '<script src="{% static \'script.js\' %}?v=3"></script>'
    )

    text = text.replace(
        '<script src="{% static \'script.js\' %}"></script>',
        '<script src="{% static \'script.js\' %}?v=3"></script>'
    )
    text = text.replace(
        '<script src="{% static \'catalog.js\' %}"></script>',
        '<script src="{% static \'catalog.js\' %}?v=3"></script>'
    )
    text = text.replace(
        '<script src="{% static \'cart.js\' %}"></script>',
        '<script src="{% static \'cart.js\' %}?v=3"></script>'
    )
    text = text.replace(
        '<script src="{% static \'auth.js\' %}"></script>',
        '<script src="{% static \'auth.js\' %}?v=3"></script>'
    )
    text = text.replace(
        '<script src="{% static \'data.js\' %}"></script>',
        '<script src="{% static \'data.js\' %}?v=3"></script>'
    )

    path.write_text(text, encoding='utf-8')

print('PATCH_DONE')
