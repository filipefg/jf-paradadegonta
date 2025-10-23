// js/main.js


import { initializeNavigation } from './modules/navigation.js';
import { initializeForms, initializeContactForm } from './modules/forms.js'; // ← CORRIGIDO
import { initializeAnimations } from './modules/animations.js';
import { initializeModals } from './modules/modals.js';
import { initializeAssociations } from './modules/associations.js';
import { initializeServices } from './modules/services.js';
import { initializeNews } from './modules/news.js';
import { initializeDocuments } from './modules/documents.js';
import { preventHorizontalScroll, updateFooterYear } from './utils/helpers.js';
import { CONFIG } from './utils/constants.js';
import { initializeSearch } from './modules/search.js';
import { initializeCalendar } from './modules/calendar.js';
import { initializeRentals } from './modules/rentals.js';

class JuntaFreguesiaApp {
    constructor() {
        this.init();
    }

    init() {
        preventHorizontalScroll();
        this.initializeModules();
        this.setupGlobalEvents();
        console.log('🚀 Junta de Freguesia App inicializada');
    }

    initializeModules() {
        try {
            initializeModals();
            initializeNavigation();
            initializeForms();        // ← Mantém se ainda existir
            initializeContactForm();  // ← NOVO formulário de contacto
            initializeAnimations();
            initializeAssociations();
            initializeServices();
            initializeNews();
            initializeDocuments();
            initializeSearch();
            initializeCalendar();
            initializeRentals();
            updateFooterYear();
        } catch (error) {
            console.error('Erro na inicialização de módulos:', error);
        }
    }

    setupGlobalEvents() {
        // Eventos de redimensionamento
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                preventHorizontalScroll();
            }, CONFIG.RESIZE_DELAY);
        });

        // Prevenir zoom em dispositivos móveis com double-tap
        document.addEventListener('touchend', (e) => {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new JuntaFreguesiaApp();
    });
} else {
    new JuntaFreguesiaApp();
}

// Exportar para uso global se necessário
window.JuntaFreguesiaApp = JuntaFreguesiaApp;