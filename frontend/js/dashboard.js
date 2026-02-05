/**
 * Sabroson Dashboard - Google Sheets Integration (Masticado Version)
 * Connects to a Google Sheets CSV to update order status and news dynamically.
 */

document.addEventListener('DOMContentLoaded', () => {
    const SHEET_ID = '11htctaNcMxrsELB_qTFhvYsAn74x24rp74p-Pr98jkU';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;

    const statusTitle = document.getElementById('cupos-title');
    const statusBody = document.getElementById('cupos-body');
    const statusIcon = document.getElementById('cupos-icon');
    const statusBtn = document.getElementById('cupos-btn');
    const novedadesLista = document.getElementById('novedades-lista');

    // Masticado Texts
    const TEXTS = {
        verde: {
            title: "🟢 Pedidos abiertos",
            body: "Estamos recibiendo pedidos con todo el cariño artesanal 💚",
            btnText: "🥐 Explorar el Menú",
            color: "#2E7D32"
        },
        amarillo: {
            title: "🟡 Cupos limitados",
            body: "Estamos en los últimos cupos del día 🟡 Te recomendamos confirmar tu pedido pronto.",
            btnText: "🥐 Ver Cupos Disponibles",
            color: "#FBC02D"
        },
        rojo: {
            title: "🔴 Cupos cerrados",
            body: "Hoy ya completamos nuestros cupos ❤️ Puedes escribirnos para agendar para el próximo día.",
            btnText: "🥐 Ver Menú para Mañana",
            color: "#C62828"
        }
    };

    async function updateDashboard() {
        try {
            // 1. Time-based Automation (8 AM - 5 PM)
            const now = new Date();
            const hour = now.getHours();

            // AUTOMATIZACIÓN DE HORARIO: Antes de las 8 AM o después de las 5 PM siempre es ROJO
            let isClosedByTime = hour < 8 || hour >= 17;

            // 2. Fetch Google Sheets Data
            const response = await fetch(CSV_URL);
            if (!response.ok) throw new Error('No se pudo conectar con los datos.');

            const data = await response.text();
            const rows = data.split('\n').map(row => parseCSVRow(row));

            // Estructura: Col A (Color del semáforo: Verde, Amarillo, Rojo)
            const dataRow = rows[1] || rows[0];
            let excelStatus = 'verde';

            if (dataRow && dataRow[0]) {
                const rawStatus = dataRow[0].trim().toLowerCase();
                // Normalizar estados
                if (rawStatus.includes('verde')) excelStatus = 'verde';
                else if (rawStatus.includes('amarillo')) excelStatus = 'amarillo';
                else if (rawStatus.includes('rojo')) excelStatus = 'rojo';
            }

            // Col C (Título Novedad), Col D (Texto Novedad)
            let newsTitle = dataRow[2] || 'Sin novedades';
            let newsText = dataRow[3] || 'Vuelve pronto para más noticias.';

            // 3. Determinar Estado Final (El horario manda sobre el Excel, excepto AMARILLO)
            let finalStatus = excelStatus;

            if (excelStatus === 'amarillo') {
                finalStatus = 'amarillo';
            } else if (isClosedByTime) {
                finalStatus = 'rojo';
            }

            // 4. Actualizar Interfaz
            updateUI(finalStatus);
            updateNewsUI(newsTitle, newsText);

        } catch (error) {
            console.error('Error actualizando dashboard:', error);
            // Fallback en caso de error: mostrar estado verde por defecto si estamos en horario
            const hour = new Date().getHours();
            if (hour >= 8 && hour < 17) updateUI('verde');
            else updateUI('rojo');
        }
    }

    function updateUI(status) {
        const content = TEXTS[status];
        if (!content) return;

        if (statusTitle) statusTitle.innerText = content.title;
        if (statusBody) statusBody.innerText = content.body;
        if (statusIcon) {
            statusIcon.style.color = content.color;
            if (status === 'verde') statusIcon.className = "fas fa-check-circle fa-3x";
            else if (status === 'amarillo') statusIcon.className = "fas fa-exclamation-circle fa-3x";
            else statusIcon.className = "fas fa-times-circle fa-3x";
        }

        if (statusBtn) {
            statusBtn.href = "index.html#productos";
            statusBtn.innerText = content.btnText;
        }
    }

    function updateNewsUI(title, text) {
        if (novedadesLista) {
            novedadesLista.innerHTML = `
                <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <strong style="display: block; color: var(--color-accent-wood); margin-bottom: 5px;">${title}</strong>
                    <span style="font-size: 0.95rem;">${text}</span>
                </li>
            `;
        }
    }

    // Helper para parsear CSV correctamente
    function parseCSVRow(row) {
        if (!row) return [];
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    // Carga inicial
    updateDashboard();

    // Refrescar cada 5 minutos
    setInterval(updateDashboard, 5 * 60 * 1000);
});
