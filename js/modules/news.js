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
            <div class="no-news-message" style="text-align: center; padding: 2rem;">
                <p style="color: var(--text-light); font-size: 1.1rem;">
                    Não existem notícias disponíveis no momento.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = noticias.map(noticia => {
        const dataFormatada = formatarData(noticia.Data);
        const imagem = noticia.Imagem || 'https://via.placeholder.com/400x200/2c5530/ffffff?text=Notícia';
        const resumo = noticia.Resumo || noticia.Conteudo?.substring(0, 150) + '...' || 'Descrição não disponível.';
        
        return `
        <article class="noticia-card" data-noticia="${noticia.ID || noticia.Titulo}">
            ${noticia.Imagem ? `
            <div class="noticia-image">
                <img src="${imagem}" 
                     alt="${noticia.Titulo}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x200/2c5530/ffffff?text=Notícia'">
            </div>
            ` : ''}
            <div class="noticia-content">
                <div class="noticia-date">${dataFormatada}</div>
                <h3>${noticia.Titulo}</h3>
                <p>${resumo}</p>
                ${noticia.Link ? `
                    <a href="${noticia.Link}" class="noticia-link" target="_blank">
                        Ler notícia completa <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : `
                    <button class="noticia-link btn-link" data-noticia-id="${noticia.ID || noticia.Titulo}">
                        Ler mais <i class="fas fa-arrow-right"></i>
                    </button>
                `}
            </div>
        </article>
        `;
    }).join('');

    // Configurar event listeners para os botões "Ler mais"
    setupNewsButtons(noticias);
    
    // Adicionar animações
    setupNewsAnimations();
}

function renderizarNoticiasFallback() {
    const container = document.querySelector(SELECTORS.NOTICIAS_CONTAINER);
    if (!container) return;

    container.innerHTML = `
        <article class="noticia-card">
            <div class="noticia-content">
                <div class="noticia-date">15 Nov 2023</div>
                <h3>Festas da Freguesia 2023 em Parada de Gonta</h3>
                <p>Programa completo das festas em honra de Nossa Senhora da Conceição na freguesia de Parada de Gonta, Tondela.</p>
                <a href="noticias/festas-freguesia-2023.html" class="noticia-link">Ler mais sobre as festas</a>
            </div>
        </article>
        <article class="noticia-card">
            <div class="noticia-content">
                <div class="noticia-date">10 Nov 2023</div>
                <h3>Obras de Melhoramento em Parada de Gonta</h3>
                <p>Iniciadas obras de requalificação do largo principal da freguesia de Parada de Gonta, concelho de Tondela.</p>
                <a href="noticias/obras-melhoramento.html" class="noticia-link">Ler mais sobre as obras</a>
            </div>
        </article>
        <article class="noticia-card">
            <div class="noticia-content">
                <div class="noticia-date">05 Nov 2023</div>
                <h3>Atividade Sénior em Parada de Gonta</h3>
                <p>Inscrições abertas para as atividades do programa "Sénior Ativo" na freguesia de Parada de Gonta.</p>
                <a href="noticias/atividade-senior.html" class="noticia-link">Ler mais sobre actividades seniores</a>
            </div>
        </article>
    `;
}

function setupNewsButtons(noticias) {
    const buttons = document.querySelectorAll('.btn-link[data-noticia-id]');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const noticiaId = e.target.getAttribute('data-noticia-id');
            const noticia = noticias.find(n => (n.ID || n.Titulo) === noticiaId);
            
            if (noticia) {
                abrirModalNoticia(noticia);
            }
        });
    });
}

function abrirModalNoticia(noticia) {
    // Criar modal dinâmico para a notícia completa
    const modalHTML = `
        <div id="noticia-modal" class="modal active" aria-hidden="false">
            <div class="modal-content" style="max-width: 800px;">
                <button class="modal-close" aria-label="Fechar modal">×</button>
                <div class="modal-header">
                    <h2 class="modal-title">${noticia.Titulo}</h2>
                    <p class="modal-date">${formatarData(noticia.Data)}</p>
                </div>
                <div class="modal-content-inner">
                    ${noticia.Imagem ? `
                    <div class="noticia-modal-image">
                        <img src="${noticia.Imagem}" 
                             alt="${noticia.Titulo}" 
                             style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 1.5rem;">
                    </div>
                    ` : ''}
                    <div class="noticia-modal-content">
                        ${noticia.Conteudo ? `
                            <p>${noticia.Conteudo}</p>
                        ` : `
                            <p>Conteúdo completo da notícia não disponível.</p>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos do modal
    const modal = document.getElementById('noticia-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => fecharModalNoticia());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModalNoticia();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal) {
            fecharModalNoticia();
        }
    });
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

function fecharModalNoticia() {
    const modal = document.getElementById('noticia-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
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