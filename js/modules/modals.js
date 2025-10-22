// js/modules/modals.js

import { SELECTORS, CSS_CLASSES, CONFIG } from '../utils/constants.js';
import { debounce } from '../utils/helpers.js';

let currentAssociations = [];
let currentNews = [];
let currentDocuments = [];

export function initializeModals() {
    console.log('🔄 Inicializando modais...');
    
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    if (!modal) {
        console.error('❌ Modal não encontrado com seletor:', SELECTORS.ASSOCIACAO_MODAL);
        return;
    }

    setupModalEvents(modal);
    setupGlobalEventListeners();
    
    console.log('✅ Modais inicializados');
}

export function setupModalEvents(modal) {
    const closeBtn = modal.querySelector(SELECTORS.MODAL_CLOSE);
    
    if (!closeBtn) {
        console.error('❌ Botão de fechar modal não encontrado');
        return;
    }
    
    // Fechar modal
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fecharModal();
    });
    
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
}

export function setupGlobalEventListeners() {
    console.log('🔧 Configurando event listeners globais...');
    
    // Eventos para associações
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-associacao');
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = button.closest('.associacao-card');
            if (card) {
                const nomeAssociacao = card.getAttribute('data-associacao');
                console.log('🏛️ Botão associação clicado:', nomeAssociacao);
                
                const associacao = currentAssociations.find(a => a.Nome === nomeAssociacao);
                if (associacao) {
                    abrirModalAssociacao(associacao);
                }
            }
        }
    });

    // Eventos para notícias
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-noticia');
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            
            const tituloNoticia = button.getAttribute('data-noticia-titulo');
            console.log('📰 Botão notícia clicado:', tituloNoticia);
            
            const noticia = currentNews.find(n => n.Titulo === tituloNoticia);
            if (noticia) {
                abrirModalNoticia(noticia);
            }
        }
    });

    // Eventos para documentos
    document.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-documento');
        if (button && !button.hasAttribute('href')) {
            e.preventDefault();
            e.stopPropagation();
            
            const tituloDocumento = button.getAttribute('data-documento-titulo');
            console.log('📄 Botão documento clicado:', tituloDocumento);
            
            const documento = currentDocuments.find(d => d.Titulo === tituloDocumento);
            if (documento) {
                abrirModalDocumento(documento);
            }
        }
    });
}

// MODAL PARA ASSOCIAÇÕES
export function abrirModalAssociacao(associacao) {
    console.log('🏛️ Abrindo modal associação:', associacao.Nome);
    abrirModal(generateAssociacaoContent(associacao), 'Associação');
}

// MODAL PARA NOTÍCIAS
export function abrirModalNoticia(noticia) {
    console.log('📰 Abrindo modal notícia:', noticia.Titulo);
    abrirModal(generateNoticiaContent(noticia), 'Notícia');
}

// MODAL PARA DOCUMENTOS
export function abrirModalDocumento(documento) {
    console.log('📄 Abrindo modal documento:', documento.Titulo);
    abrirModal(generateDocumentoContent(documento), 'Documento');
}

// FUNÇÃO PRINCIPAL PARA ABRIR MODAL
function abrirModal(content, type = 'Conteúdo') {
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    const modalBody = document.querySelector(SELECTORS.MODAL_BODY);
    
    if (!modal || !modalBody) {
        console.error('❌ Modal ou modal body não encontrado');
        return;
    }

    console.log(`✅ Abrindo modal para: ${type}`);

    // INSERIR conteúdo SEM bloquear scroll
    modalBody.innerHTML = content;
    
    // Ajustar tamanho do modal conforme o tipo
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        if (type === 'Notícia') {
            modalContent.style.maxWidth = '800px';
        } else {
            modalContent.style.maxWidth = '700px';
        }
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Animação de entrada
    setTimeout(() => {
        modal.classList.add(CSS_CLASSES.ACTIVE);
    }, 10);
    
    // Focar no botão de fechar para acessibilidade
    setTimeout(() => {
        const closeBtn = modal.querySelector(SELECTORS.MODAL_CLOSE);
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 100);
}

// GERAR CONTEÚDO PARA ASSOCIAÇÕES
function generateAssociacaoContent(associacao) {
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

// GERAR CONTEÚDO PARA NOTÍCIAS
function generateNoticiaContent(noticia) {
    const dataFormatada = formatarData(noticia.Data);
    const imagem = noticia.Imagem || 'https://via.placeholder.com/800x400/2c5530/ffffff?text=Notícia';
    
    return `
        <div class="modal-header">
            <div class="modal-image-container">
                <img src="${imagem}" 
                     alt="${noticia.Titulo}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/800x400/2c5530/ffffff?text=Notícia'">
            </div>
            <h2 class="modal-title">${noticia.Titulo}</h2>
            ${dataFormatada ? `<p class="modal-date">${dataFormatada}</p>` : ''}
        </div>
        <div class="modal-content-inner">
            <div class="noticia-modal-content">
                <p>${noticia.Conteudo || 'Conteúdo completo da notícia não disponível.'}</p>
            </div>
        </div>
    `;
}

// GERAR CONTEÚDO PARA DOCUMENTOS
function generateDocumentoContent(documento) {
    const dataFormatada = documento.Data ? formatarData(documento.Data) : '';
    
    return `
        <div class="modal-header">
            <h2 class="modal-title">${documento.Titulo}</h2>
            ${dataFormatada ? `<p class="modal-date">${dataFormatada}</p>` : ''}
        </div>
        <div class="modal-content-inner">
            <div class="documento-modal-content">
                <p>${documento.Descricao || 'Descrição não disponível.'}</p>
                
                ${documento.Link ? `
                    <div class="documento-actions">
                        <a href="${documento.Link}" class="btn" target="_blank" 
                           style="display: inline-flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-download"></i> Descarregar Documento
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// FUNÇÃO PARA FECHAR MODAL
export function fecharModal() {
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    if (!modal) return;

    console.log('🔒 Fechando modal');

    // Animação de saída
    modal.classList.remove(CSS_CLASSES.ACTIVE);
    
    setTimeout(() => {
        modal.style.display = 'none';
        // REMOVER: Não restaurar scroll porque nunca foi bloqueado
        modal.setAttribute('aria-hidden', 'true');
    }, CONFIG.ANIMATION_DELAY);
}

// FUNÇÃO AUXILIAR PARA FORMATAR DATA
function formatarData(dataString) {
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            return dataString;
        }
        
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return data.toLocaleDateString('pt-PT', options);
    } catch (error) {
        return dataString;
    }
}

// EXPORTAR FUNÇÕES PARA OUTROS MÓDULOS
export function setCurrentAssociations(associacoes) {
    currentAssociations = associacoes;
    console.log('📋 Associações definidas:', currentAssociations.length);
}

export function setCurrentNews(noticias) {
    currentNews = noticias;
    console.log('📰 Notícias definidas:', currentNews.length);
}

export function setCurrentDocuments(documentos) {
    currentDocuments = documentos;
    console.log('📄 Documentos definidos:', currentDocuments.length);
}