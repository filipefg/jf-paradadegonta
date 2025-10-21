// js/modules/news.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';

export function initializeNews() {
    const container = document.querySelector(SELECTORS.NOTICIAS_CONTAINER);
    if (!container) {
        console.log('Container de notícias não encontrado');
        return;
    }

    carregarNoticias();
}

export async function carregarNoticias() {
    try {
        const response = await fetch(CONFIG.NEWS_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvData = await response.text();
        const noticias = csvParaJSON(csvData);
        
        renderizarNoticias(noticias);
        console.log('Notícias carregadas:', noticias);
        
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        // Fallback para notícias estáticas
        renderizarNoticiasFallback();
    }
}

function csvParaJSON(csv) {
    const linhas = csv.split('\n').filter(linha => linha.trim() !== '');
    
    if (linhas.length === 0) {
        return [];
    }
    
    const headers = linhas[0].split(',').map(header => 
        header.trim().replace(/"/g, '')
    );
    
    return linhas.slice(1)
        .map(linha => {
            const valores = [];
            let current = '';
            let insideQuotes = false;
            
            for (let char of linha) {
                if (char === '"') {
                    insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                    valores.push(current.trim().replace(/"/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            valores.push(current.trim().replace(/"/g, ''));
            
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = valores[index] || '';
            });
            return obj;
        })
        .filter(noticia => noticia.Titulo && noticia.Titulo.trim() !== '')
        .sort((a, b) => new Date(b.Data) - new Date(a.Data)); // Ordenar por data mais recente
}

function formatarData(dataString) {
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            return dataString; // Retorna original se não for data válida
        }
        
        const options = { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        };
        return data.toLocaleDateString('pt-PT', options);
    } catch (error) {
        return dataString;
    }
}

function renderizarNoticias(noticias) {
    const container = document.querySelector(SELECTORS.NOTICIAS_CONTAINER);
    if (!container) return;

    console.log('Renderizando notícias:', noticias);

    if (noticias.length === 0) {
        container.innerHTML = `
            <div class="no-news-message" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <p style="color: var(--text-light); font-size: 1.1rem;">
                    Não existem notícias disponíveis no momento.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = noticias.map(noticia => {
        const dataFormatada = formatarData(noticia.Data);
        const imagem = noticia.Imagem || 'https://via.placeholder.com/600x200/2c5530/ffffff?text=Notícia';
        const resumo = noticia.Resumo || noticia.Conteudo?.substring(0, 120) + '...' || 'Descrição não disponível.';
        
        return `
        <div class="noticia-card card" data-noticia="${noticia.Titulo}">
            <div class="noticia-image">
                <img src="${imagem}" 
                     alt="${noticia.Titulo}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/600x200/2c5530/ffffff?text=Notícia'">
            </div>
            <div class="noticia-content">
                <div class="noticia-date">${dataFormatada}</div>
                <h3>${noticia.Titulo}</h3>
                <p>${resumo}</p>
                <button class="btn-noticia btn btn-small" 
                        data-noticia-titulo="${noticia.Titulo}"
                        aria-label="Ler notícia completa sobre ${noticia.Titulo}">
                    Ler Notícia
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Configurar event listeners para os botões
    setupNewsButtons(noticias);
    
    // Adicionar animações
    setupNewsAnimations();
}

function renderizarNoticiasFallback() {
    const container = document.querySelector(SELECTORS.NOTICIAS_CONTAINER);
    if (!container) return;

    container.innerHTML = `
        <div class="noticia-card card">
            <div class="noticia-image">
                <img src="https://via.placeholder.com/600x200/2c5530/ffffff?text=Festas" 
                     alt="Festas da Freguesia 2023" 
                     loading="lazy">
            </div>
            <div class="noticia-content">
                <div class="noticia-date">15 Nov 2023</div>
                <h3>Festas da Freguesia 2023 em Parada de Gonta</h3>
                <p>Programa completo das festas em honra de Nossa Senhora da Conceição na freguesia de Parada de Gonta, Tondela.</p>
                <button class="btn-noticia btn btn-small" data-noticia-titulo="Festas da Freguesia 2023">
                    Ler Notícia
                </button>
            </div>
        </div>
        <div class="noticia-card card">
            <div class="noticia-image">
                <img src="https://via.placeholder.com/600x200/2c5530/ffffff?text=Obras" 
                     alt="Obras de Melhoramento" 
                     loading="lazy">
            </div>
            <div class="noticia-content">
                <div class="noticia-date">10 Nov 2023</div>
                <h3>Obras de Melhoramento em Parada de Gonta</h3>
                <p>Iniciadas obras de requalificação do largo principal da freguesia de Parada de Gonta, concelho de Tondela.</p>
                <button class="btn-noticia btn btn-small" data-noticia-titulo="Obras de Melhoramento">
                    Ler Notícia
                </button>
            </div>
        </div>
        <div class="noticia-card card">
            <div class="noticia-image">
                <img src="https://via.placeholder.com/600x200/2c5530/ffffff?text=Sénior" 
                     alt="Atividade Sénior" 
                     loading="lazy">
            </div>
            <div class="noticia-content">
                <div class="noticia-date">05 Nov 2023</div>
                <h3>Atividade Sénior em Parada de Gonta</h3>
                <p>Inscrições abertas para as atividades do programa "Sénior Ativo" na freguesia de Parada de Gonta.</p>
                <button class="btn-noticia btn btn-small" data-noticia-titulo="Atividade Sénior">
                    Ler Notícia
                </button>
            </div>
        </div>
    `;

    // Configurar botões para o fallback
    const noticiasFallback = [
        {
            Titulo: "Festas da Freguesia 2023 em Parada de Gonta",
            Data: "2023-11-15",
            Conteudo: "Programa completo das festas em honra de Nossa Senhora da Conceição na freguesia de Parada de Gonta, Tondela. As festas incluem procissão, arraial popular e atividades culturais."
        },
        {
            Titulo: "Obras de Melhoramento em Parada de Gonta", 
            Data: "2023-11-10",
            Conteudo: "Iniciadas obras de requalificação do largo principal da freguesia de Parada de Gonta, concelho de Tondela. Estas obras visam melhorar a acessibilidade e embelezar o espaço público."
        },
        {
            Titulo: "Atividade Sénior em Parada de Gonta",
            Data: "2023-11-05", 
            Conteudo: "Inscrições abertas para as atividades do programa 'Sénior Ativo' na freguesia de Parada de Gonta. O programa inclui atividades físicas, workshops e passeios culturais."
        }
    ];
    
    setupNewsButtons(noticiasFallback);
}

// Modal completamente corrigido
function generateModalContent(noticia) {
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
            <p class="modal-date">${dataFormatada}</p>
        </div>
        <div class="modal-content-inner">
            <div class="noticia-modal-content">
                <p>${noticia.Conteudo || 'Conteúdo completo da notícia não disponível.'}</p>
            </div>
        </div>
    `;
}


function setupNewsButtons(noticias) {
    const buttons = document.querySelectorAll('.btn-noticia');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const tituloNoticia = e.target.getAttribute('data-noticia-titulo');
            console.log('Botão de notícia clicado:', tituloNoticia);
            
            const noticia = noticias.find(n => n.Titulo === tituloNoticia);
            if (noticia) {
                console.log('Notícia encontrada, abrindo modal:', noticia);
                abrirModalNoticia(noticia);
            } else {
                console.error('Notícia não encontrada:', tituloNoticia);
            }
        });
    });

    // Também adicionar listener global como fallback
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-noticia') || 
            e.target.closest('.btn-noticia')) {
            
            const button = e.target.classList.contains('btn-noticia') 
                ? e.target 
                : e.target.closest('.btn-noticia');
            
            const tituloNoticia = button.getAttribute('data-noticia-titulo');
            console.log('Clique direto no botão detectado:', tituloNoticia);
            
            const noticia = noticias.find(n => n.Titulo === tituloNoticia);
            if (noticia) {
                e.preventDefault();
                e.stopPropagation();
                abrirModalNoticia(noticia);
            }
        }
    });
}

function abrirModalNoticia(noticia) {
    console.log('Abrindo modal para notícia:', noticia.Titulo);

    // Usar o mesmo modal das associações, mas com conteúdo de notícia
    const modal = document.querySelector(SELECTORS.ASSOCIACAO_MODAL);
    const modalBody = document.querySelector(SELECTORS.MODAL_BODY);
    
    if (!modal || !modalBody) {
        console.error('Modal ou modal body não encontrado');
        return;
    }

    // Limpar estilos antigos que possam estar a interferir
    modalBody.innerHTML = generateModalContent(noticia);
    
    // Forçar largura máxima maior para o modal de notícias
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.maxWidth = '800px';
    }
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Animação de entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Focar no botão de fechar para acessibilidade
    setTimeout(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }, 100);

    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function setupNewsAnimations() {
    const noticiaCards = document.querySelectorAll('.noticia-card');
    
    noticiaCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(card);
    });
}

// Exportar para uso global se necessário
window.carregarNoticias = carregarNoticias;