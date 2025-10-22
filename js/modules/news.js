// js/modules/news.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';
import { setCurrentNews } from './modals.js';

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
        setCurrentNews(noticias); // ← DEFINIR NOTÍCIAS ATUAIS
        console.log('Notícias carregadas:', noticias);
        
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
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
    
    // Manter apenas as animações
    setupNewsAnimations();
}

// MANTER APENAS AS ANIMAÇÕES
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