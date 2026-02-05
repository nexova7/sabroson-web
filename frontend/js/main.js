document.addEventListener('DOMContentLoaded', () => {
    console.log("Sabroson JS Loaded");

    // --- CART STATE ---
    let cart = JSON.parse(localStorage.getItem('sabroson_cart')) || [];

    // --- DRAWER LOGIC ---
    const drawer = document.getElementById('order-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');
    const cartToggles = document.querySelectorAll('.cart-link');

    function openDrawer(e) {
        if (e) e.preventDefault();
        if (drawer) {
            drawer.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateCartUI();
        }
    }

    function closeDrawer() {
        if (drawer) {
            drawer.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    cartToggles.forEach(btn => btn.addEventListener('click', openDrawer));
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

    // --- SEMAPHORE & GOOGLE SHEETS ---
    const SHEET_ID = '11htctaNcMxrsELB_qTFhvYsAn74x24rp74p-Pr98jkU';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;
    let currentDayStatus = 'VERDE';

    async function fetchSemaphoreStatus() {
        try {
            const now = new Date();
            const hour = now.getHours();

            // Automation logic
            let isClosedByTime = hour < 8 || hour >= 17;

            const response = await fetch(CSV_URL);
            if (!response.ok) throw new Error();
            const data = await response.text();
            const rows = data.split('\n');
            const dataRow = rows[1]?.split(',') || [];

            const sheetStatus = (dataRow[0] || '').trim().toUpperCase();

            // AMARILLO has priority
            if (sheetStatus === 'AMARILLO') {
                currentDayStatus = 'AMARILLO';
            } else if (isClosedByTime) {
                currentDayStatus = 'ROJO';
            } else {
                currentDayStatus = sheetStatus || 'VERDE';
            }

            updateSemaphoreUI();
        } catch (e) {
            console.error("Error fetching status", e);
        }
    }

    function updateSemaphoreUI() {
        const statuses = {
            'VERDE': { class: 'status-verde', dot: 'dot-verde', text: 'Estamos recibiendo pedidos con todo el cariño artesanal 💚' },
            'AMARILLO': { class: 'status-amarillo', dot: 'dot-amarillo', text: 'Estamos en los últimos cupos del día 🟡 Te recomendamos confirmar tu pedido pronto.' },
            'ROJO': { class: 'status-rojo', dot: 'dot-rojo', text: 'Hoy ya completamos nuestros cupos ❤️ Puedes escribirnos para agendar para el próximo día.' }
        };
        const config = statuses[currentDayStatus] || statuses['VERDE'];

        const drawerSemaphore = document.getElementById('drawer-semaphore');
        const drText = document.getElementById('drawer-status-text');
        if (drawerSemaphore && drText) {
            drawerSemaphore.className = `semaphore-status ${config.class}`;
            const dot = drawerSemaphore.querySelector('.status-dot');
            if (dot) dot.className = `status-dot ${config.dot}`;
            drText.innerText = config.text;
        }
    }

    fetchSemaphoreStatus();
    setInterval(fetchSemaphoreStatus, 60000);

    // --- PRODUCT CLICK HANDLER (AGREGAR DIRECTO) ---
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.product-btn');
        if (btn) {
            const productName = btn.getAttribute('data-product');
            const existing = cart.find(item => item.name === productName);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ name: productName, qty: 1 });
            }
            saveCart();
            openDrawer();
        }
    });

    // --- WHATSAPP ORDER GENERATION (FORMATO EXACTO CON SEMÁFORO) ---
    const sendBtn = document.getElementById('send-cart-whatsapp');

    if (sendBtn) {
        sendBtn.onclick = () => {
            if (cart.length === 0) return;
            const itemsList = cart.map(item => `- ${item.name} (${item.qty})`).join('\n');
            const message = `Hola 👋💛\nVengo desde la página SabroSon.\n\nEstoy interesada en los siguientes productos:\n${itemsList}\n\nEstado de pedidos hoy: ${currentDayStatus}\n\nQuisiera confirmar disponibilidad y tiempo de entrega.\nGracias 🤎`;

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

    // --- 3D TILT EFFECT (Refinado con "Papel Levantado") ---
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Intensidad elegante
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.boxShadow = `${-rotateY / 2}px ${rotateX / 2}px 30px rgba(62, 39, 35, 0.25)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.boxShadow = '0 10px 20px var(--color-shadow)';
        });
    });

    // --- ACTIVE LINK HIGHLIGHTING ---
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === 'index.html' && href === '#')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
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

    // --- FAQ ACCORDION ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isActive = item.classList.contains('active');

            // Close all other items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    updateCartUI();
});
