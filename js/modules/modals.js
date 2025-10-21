// js/modules/modals.js

import { SELECTORS, CSS_CLASSES, CONFIG } from '../utils/constants.js';
import { debounce } from '../utils/helpers.js';

let currentAssociations = [];

export function initializeModals() {
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    if (!modal) {
        console.error('Modal não encontrado com seletor:', SELECTORS.ASSOCIACAO_MODAL);
        return;
    }

    setupModalEvents(modal);
    setupGlobalEventListeners();
    
    console.log('Modais inicializados');
}

export function setupModalEvents(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    
    if (!closeBtn) {
        console.error('Botão de fechar modal não encontrado');
        return;
    }
    
    // Fechar modal
    closeBtn.addEventListener('click', () => fecharModal());
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            fecharModal();
        }
    });
    
    // Fechar ao clicar no overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Swipe para fechar em mobile
    setupMobileSwipe(modal);
}

export function setupGlobalEventListeners() {
    // Ouvir eventos customizados dos botões das associações
    document.addEventListener('associacaoButtonClick', (e) => {
        const nomeAssociacao = e.detail.nomeAssociacao;
        console.log('Evento associacaoButtonClick recebido:', nomeAssociacao);
        
        const associacao = currentAssociations.find(a => a.Nome === nomeAssociacao);
        if (associacao) {
            console.log('Associação encontrada, abrindo modal:', associacao);
            abrirModal(associacao);
        } else {
            console.error('Associação não encontrada:', nomeAssociacao);
            console.log('Associações disponíveis:', currentAssociations);
        }
    });

    // Também manter listener direto nos botões como fallback
    document.addEventListener('click', (e) => {
        // Só abrir modal se clicar especificamente no botão
        if (e.target.classList.contains('btn-associacao') || 
            e.target.closest('.btn-associacao')) {
            
            const button = e.target.classList.contains('btn-associacao') 
                ? e.target 
                : e.target.closest('.btn-associacao');
            
            const card = button.closest('.associacao-card');
            if (card) {
                const nomeAssociacao = card.getAttribute('data-associacao');
                console.log('Clique direto no botão detectado:', nomeAssociacao);
                
                const associacao = currentAssociations.find(a => a.Nome === nomeAssociacao);
                if (associacao) {
                    e.preventDefault();
                    e.stopPropagation();
                    abrirModal(associacao);
                }
            }
        }
    });
}


export function abrirModal(associacao) {
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    const modalBody = document.querySelector(SELECTORS.MODAL_BODY);
    
    if (!modal || !modalBody) {
        console.error('Modal ou modal body não encontrado');
        return;
    }

    console.log('Abrindo modal para:', associacao.Nome);

    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    modalBody.innerHTML = generateModalContent(associacao);
    
    // Forçar largura máxima maior para o modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.maxWidth = '800px';
    }
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Animação de entrada
    setTimeout(() => {
        modal.classList.add(CSS_CLASSES.ACTIVE);
    }, 10);
    
    // Focar no botão de fechar para acessibilidade
    setTimeout(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 100);
}

export function fecharModal() {
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    if (!modal) return;

    console.log('Fechando modal');

    // Animação de saída
    modal.classList.remove(CSS_CLASSES.ACTIVE);
    
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Restaurar scroll
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        modal.setAttribute('aria-hidden', 'true');
    }, CONFIG.ANIMATION_DELAY);
}

function generateModalContent(associacao) {
    const imagem = associacao.Logo || 'https://via.placeholder.com/800x300/2c5530/ffffff?text=Associação';
    
    return `
        <div class="modal-header">
            <div class="modal-image-container">
                <img src="${imagem}" 
                     alt="Logo ${associacao.Nome}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/800x300/2c5530/ffffff?text=Associação'">
            </div>
            <h2 class="modal-title">${associacao.Nome}</h2>
        </div>
        <div class="modal-content-inner">
            <div class="associacao-modal-content">
                <p>${associacao.Descricao || 'Descrição não disponível'}</p>
                
                ${associacao.Fundacao ? `
                    <p class="modal-date">
                        <i class="fas fa-calendar-alt"></i> Fundada em ${associacao.Fundacao}
                    </p>
                ` : ''}
                
                <div class="associacao-contact-info">
                    <h4><i class="fas fa-address-card"></i> Informações de Contacto</h4>
                    ${associacao.Email ? `
                        <p>
                            <i class="fas fa-envelope"></i> 
                            <a href="mailto:${associacao.Email}">
                                ${associacao.Email}
                            </a>
                        </p>
                    ` : ''}
                    ${associacao.Telefone ? `
                        <p>
                            <i class="fas fa-phone"></i> 
                            <a href="tel:${associacao.Telefone.replace(/\s/g, '')}">
                                ${associacao.Telefone}
                            </a>
                        </p>
                    ` : ''}
                    ${associacao.Morada ? `
                        <p>
                            <i class="fas fa-map-marker-alt"></i> 
                            <span>${associacao.Morada}</span>
                        </p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function setupMobileSwipe(modal) {
    if (!('ontouchstart' in window)) return;

    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;

    let startY = 0;
    let isSwiping = false;
    
    modalContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isSwiping = true;
    });
    
    modalContent.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        // Swipe para baixo para fechar
        if (diff > 50 && window.innerWidth <= 768) {
            fecharModal();
            isSwiping = false;
        }
    });
    
    modalContent.addEventListener('touchend', () => {
        isSwiping = false;
    });
}

// Exportar para uso por outros módulos
export function setCurrentAssociations(associacoes) {
    currentAssociations = associacoes;
    console.log('Associações definidas no modal:', currentAssociations);
}

// Função para debug
export function getCurrentAssociations() {
    return currentAssociations;
}