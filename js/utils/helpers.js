// js/modules/helpers.js

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
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `global-notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

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

    const styles = {
        success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
        error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
        info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
        warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' }
    };

    Object.assign(notification.style, styles[type] || styles.info);

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

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
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Funções auxiliares para o sistema de alugueres
export function calcularDiasEntreDatas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function extrairValorNumerico(precoString) {
    return parseFloat(precoString.replace('€', '').trim());
}

export function validarDatasReserva(dataInicio, dataFim) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (inicio < hoje) {
        return { valido: false, erro: 'A data de início não pode ser no passado' };
    }
    
    if (fim <= inicio) {
        return { valido: false, erro: 'A data de fim deve ser após a data de início' };
    }
    
    return { valido: true };
}

export function formatarMoeda(valor) {
    return `${valor}€`;
}