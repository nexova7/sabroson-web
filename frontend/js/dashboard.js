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
            title: "🟢 Aún estamos recibiendo pedidos.",
            body: "Hoy todavía tenemos un espacio en la cocina para preparar algo especial para ti. Todo lo que hacemos es casero, con calma y a mano, como en casa de la abuela. Escríbenos y aparta tu cupito 🍞💛",
            whatsapp: "Hola Sabroson, vi que tienen cupos. Quiero apartar un pedido para hoy.",
            color: "#2E7D32"
        },
        amarillo: {
            title: "🟡 Ya casi se llena la agenda.",
            body: "Nos quedan muy poquitos cupos para hoy. La cocina va tomando ritmo y las manos no dan para más cuando queremos hacerlo bien, sin afanes y con el sabor de siempre. Consúltanos y no te quedes con las ganas ⏳🍰",
            whatsapp: "Hola Sabroson, vi que quedan pocos cupos. ¿Aún alcanzo a pedir para hoy?",
            color: "#FBC02D"
        },
        rojo: {
            title: "🔴 Por hoy la cocina ya está completa.",
            body: "Gracias a Dios y a ustedes, hoy ya no tenemos más cupos disponibles. Ya estamos organizando los pedidos para mañana. Nota: Ten presente que los tiempos de entrega varían según tu pedido; te confirmaremos al recibir tu mensaje.",
            whatsapp: "Hola Sabroson, vi que ya no hay cupos para hoy, pero quiero apartar mi lugar para el próximo día disponible. Entiendo que los tiempos de entrega varían.",
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

            // 3. Determinar Estado Final (El horario manda sobre el Excel)
            let finalStatus = isClosedByTime ? 'rojo' : excelStatus;

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
            const phone = '573133531388';
            const encodedMsg = encodeURIComponent(content.whatsapp);
            statusBtn.href = `https://wa.me/${phone}?text=${encodedMsg}`;
            statusBtn.innerText = status === 'rojo' ? 'Apartar cupo para mañana' : 'Hacer Pedido Rápido';
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
