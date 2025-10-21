// js/modules/animations.js

import { CONFIG, CSS_CLASSES } from '../utils/constants.js';

export function initializeAnimations() {
    setupScrollAnimations();
    setupLazyLoading();
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: CONFIG.LAZY_LOAD_THRESHOLD,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Elementos para animar
    const animateElements = document.querySelectorAll(
        '.card, .noticia-card, .sobre-content > div, .contactos-content > div'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
}

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.unobserve(entry.target);
        }
    });
}

function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove(CSS_CLASSES.LAZY);
                imageObserver.unobserve(img);
            }
        });
    }, {
        threshold: CONFIG.LAZY_LOAD_THRESHOLD
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}