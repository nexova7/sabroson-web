document.addEventListener('DOMContentLoaded', () => {
    console.log("Sabroson JS Loaded");

    // --- CART STATE ---
    let cart = JSON.parse(localStorage.getItem('sabroson_cart')) || [];

    // --- DRAWER LOGIC ---
    const drawer = document.getElementById('order-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');
    const cartToggle = document.querySelector('a[href="#pedido"]');

    function openDrawer(e) {
        if (e) e.preventDefault();
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartUI();
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (cartToggle) cartToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // --- CART FUNCTIONS ---
    function saveCart() {
        localStorage.setItem('sabroson_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const cartEmpty = document.getElementById('cart-empty');
        const cartContent = document.getElementById('cart-content');
        const cartItemsDiv = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');

        if (cartCount) {
            const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
            cartCount.innerText = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }

        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartContent.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartContent.style.display = 'block';
            cartItemsDiv.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <button class="remove-btn" onclick="removeFromCart(${index})">Eliminar</button>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
            `).join('');
        }
    }

    window.changeQty = (index, delta) => {
        cart[index].qty += delta;
        if (cart[index].qty < 1) cart[index].qty = 1;
        saveCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
    };

    // --- ADD TO CART (From Menu) ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.whatsapp-btn');
        if (btn) {
            const productName = btn.getAttribute('data-product');
            const existing = cart.find(item => item.name === productName);

            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ name: productName, qty: 1 });
            }

            saveCart();
            openDrawer(); // Abrir el panel automáticamente al agregar
        }
    });

    // --- WHATSAPP ORDER GENERATION ---
    const sendBtn = document.getElementById('send-cart-whatsapp');
    const discountInput = document.getElementById('discount-code');

    if (sendBtn) {
        sendBtn.onclick = () => {
            const code = discountInput.value.trim();
            const itemsList = cart.map(item => `– ${item.name} × ${item.qty}`).join('\n');

            let message = `Hola 😊\nMe gustaría consultar disponibilidad para el siguiente pedido artesanal:\n\n${itemsList}`;

            if (code) {
                message += `\n\nCódigo de beneficio: ${code}`;
            }

            message += `\n\nQuedo atento(a) a tiempos de entrega, valor final y forma de pago.\n¡Muchas gracias! 🤍`;

            const phone = '573133531388';
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        };
    }

    // --- CAROUSEL LOGIC ---
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- 3D TILT EFFECT (Restaurado) ---
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Intensidad de 20 grados para un efecto "wow"
            const rotateX = ((y - centerY) / centerY) * -20;
            const rotateY = ((x - centerX) / centerX) * 20;

            card.style.transition = 'transform 0.1s ease-out';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s ease';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // Mouse Trail - Mini Cupcakes & Donuts
    document.addEventListener('mousemove', (e) => {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        trail.innerHTML = Math.random() > 0.5 ? '🧁' : '🍩';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 800);
    });

    // Auto-scroll Blog
    const leftCol = document.querySelector('.blog-column-left');
    const rightCol = document.querySelector('.blog-column-right');
    if (leftCol && rightCol && window.innerWidth > 768) {
        let posL = 0; let posR = -200;
        function step() {
            posL -= 0.5; posR += 0.5;
            if (posL < -500) posL = 0;
            if (posR > 0) posR = -500;
            leftCol.style.transform = `translateY(${posL}px)`;
            rightCol.style.transform = `translateY(${posR}px)`;
            requestAnimationFrame(step);
        }
        step();
    }

    updateCartUI();
});
