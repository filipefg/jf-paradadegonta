// js/utils/helpers.js

import { CSS_CLASSES } from './constants.js';

export function preventHorizontalScroll() {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
}

export function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.footer-bottom p');
    
    yearElements.forEach(element => {
        if (element.textContent.includes('2023') || element.textContent.includes('2024')) {
            element.innerHTML = element.innerHTML.replace(/(2023|2024)/g, currentYear.toString());
        }
    });
}

export function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `global-notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        fontWeight: '600',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateX(150%)',
        transition: 'transform 0.3s ease'
    });

    // Cores por tipo
    const styles = {
        success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
        warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' }
    };

    Object.assign(notification.style, styles[type] || styles.info);

    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover automaticamente
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

export function formatPhoneNumber(phone) {
    return phone.replace(/\s/g, '');
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

export function exportarCalendario() {
    // Exportar eventos para ficheiro ICS
    const eventosICS = gerarFicheiroICS(todosEventos);
    const blob = new Blob([eventosICS], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventos-parada-gonta.ics';
    a.click();
    URL.revokeObjectURL(url);
}

export function inscreverNotificacoes() {
    if (!('Notification' in window)) {
        showNotification('As notificações não são suportadas no seu navegador.', 'warning');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showNotification('Lembretes ativados com sucesso!', 'success');
        }
    });
}