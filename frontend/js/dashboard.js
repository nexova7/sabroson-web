/**
 * Sabroson Dashboard - Google Sheets Integration (Masticado Version)
 * Connects to a Google Sheets CSV to update order status and news dynamically.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- GOOGLE SHEETS INTEGRATION (Dynamic Reading) ---
    const GVIZ_URL = 'https://docs.google.com/spreadsheets/d/11htctaNcMxrsELB_qTFhvYsAn74x24rp74p-Pr98jkU/gviz/tq?tqx=out:json';

    const statusTitle = document.getElementById('cupos-title');
    const statusBody = document.getElementById('cupos-body');
    const statusIcon = document.getElementById('cupos-icon');
    const statusBtn = document.getElementById('cupos-btn');
    const novedadesLista = document.getElementById('novedades-lista');

    // Mappings for colors and icons
    const STATUS_CONFIG = {
        verde: { title: "🟢 Pedidos abiertos", color: "#2E7D32", icon: "fas fa-check-circle fa-3x", btn: "🥐 Explorar el Menú" },
        amarillo: { title: "🟡 Cupos limitados", color: "#FBC02D", icon: "fas fa-exclamation-circle fa-3x", btn: "🥐 Ver Cupos Disponibles" },
        rojo: { title: "🔴 Cupos cerrados", color: "#C62828", icon: "fas fa-times-circle fa-3x", btn: "🥐 Ver Menú para Mañana" }
    };

    async function updateDashboard() {
        try {
            const response = await fetch(GVIZ_URL + '&t=' + new Date().getTime()); // Prevent caching
            const text = await response.text();
            const jsonStr = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
            const json = JSON.parse(jsonStr);
            const rows = json.table.rows;

            // Segunda fila de datos (Index 1)
            const dataRow = rows[1];
            if (!dataRow) return;

            const cols = dataRow.c;
            const estado = (cols[0]?.v || 'verde').toLowerCase().trim();
            const mensaje = cols[1]?.v || '';
            const tituloNovedad = cols[2]?.v || '';
            const textoNovedad = cols[3]?.v || '';

            updateStatusUI(estado, mensaje);
            updateNewsUI(tituloNovedad, textoNovedad);

        } catch (error) {
            console.error('Error actualizando dashboard desde Google Sheets:', error);
        }
    }

    function updateStatusUI(estado, mensaje) {
        const config = STATUS_CONFIG[estado] || STATUS_CONFIG['verde'];

        if (statusTitle) statusTitle.innerText = config.title;
        if (statusBody) statusBody.innerText = mensaje || 'Sin mensaje disponible';
        if (statusIcon) {
            statusIcon.style.color = config.color;
            statusIcon.className = config.icon;
        }
        if (statusBtn) {
            statusBtn.href = "index.html#productos";
            statusBtn.innerText = config.btn;
        }
    }

    function updateNewsUI(title, text) {
        if (novedadesLista) {
            if (!title && !text) {
                novedadesLista.innerHTML = '<li>Sin novedades por el momento.</li>';
                return;
            }
            novedadesLista.innerHTML = `
                <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <strong style="display: block; color: var(--color-accent-wood); margin-bottom: 5px;">${title || ''}</strong>
                    <span style="font-size: 0.95rem;">${text || ''}</span>
                </li>
            `;
        }
    }

    // Carga inicial
    updateDashboard();


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
});
