// js/main.js

import { initializeNavigation } from './modules/navigation.js';
import { initializeForms } from './modules/forms.js';
import { initializeAnimations } from './modules/animations.js';
import { initializeAssociations } from './modules/associations.js';
import { initializeModals } from './modules/modals.js';
import { initializeServices } from './modules/services.js';
import { initializeNews } from './modules/news.js';
import { initializeDocuments } from './modules/documents.js'; // ← NOVO
import { preventHorizontalScroll, updateFooterYear } from './utils/helpers.js';
import { CONFIG } from './utils/constants.js';
import { initializeSearch } from './modules/search.js';

class JuntaFreguesiaApp {
    constructor() {
        this.init();
    }

    init() {
        // Prevenir scroll horizontal
        preventHorizontalScroll();
        
        // Inicializar módulos
        this.initializeModules();
        
        // Configurações globais
        this.setupGlobalEvents();
        
        console.log('🚀 Junta de Freguesia App inicializada');
    }

    initializeModules() {
        try {
            initializeNavigation();
            initializeForms();
            initializeAnimations();
            initializeAssociations();
            initializeModals();
            initializeServices();
            initializeNews();
            initializeDocuments();
            initializeSearch(); // ← NOVO: Inicializar sistema de pesquisa
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