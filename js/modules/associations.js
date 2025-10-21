// js/modules/associations.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';
import { setCurrentAssociations } from './modals.js';

export function initializeAssociations() {
    const container = document.querySelector(SELECTORS.ASSOCIACOES_CONTAINER);
    if (!container) return;

    carregarAssociacoes();
}

export async function carregarAssociacoes() {
    try {
        const response = await fetch(CONFIG.ASSOCIATIONS_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvData = await response.text();
        const associacoes = csvParaJSON(csvData);
        
        renderizarAssociacoes(associacoes);
        setCurrentAssociations(associacoes);
        
        console.log('Associações carregadas:', associacoes);
        
    } catch (error) {
        console.error('Erro ao carregar associações:', error);
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
        .filter(assoc => assoc.Nome && assoc.Nome.trim() !== '');
}

function renderizarAssociacoes(associacoes) {
    const container = document.querySelector(SELECTORS.ASSOCIACOES_CONTAINER);
    if (!container) return;

    console.log('Renderizando associações:', associacoes);

    container.innerHTML = associacoes.map(associacao => {
        const imagem = associacao.Logo || 'https://via.placeholder.com/600x200/2c5530/ffffff?text=Associação';
        const descricao = associacao.Descricao || 'Descrição não disponível';
        
        return `
        <div class="associacao-card card" data-associacao="${associacao.Nome}">
            <div class="associacao-image">
                <img src="${imagem}" 
                     alt="Logo ${associacao.Nome}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/600x200/2c5530/ffffff?text=Associação'">
            </div>
            <div class="associacao-content">
                <h3>${associacao.Nome}</h3>
                <p>${descricao}</p>
                <button class="btn-associacao btn btn-small" 
                        aria-label="Mais informações sobre ${associacao.Nome}">
                    Mais Informações
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Configurar event listeners apenas para os botões
    setupAssociationsButtons();
    
    // Adicionar animações
    setupAssociationsAnimations();
}

function setupAssociationsButtons() {
    const buttons = document.querySelectorAll('.btn-associacao');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Prevenir que o clique se propague para o card
            e.stopPropagation();
            
            const card = e.target.closest('.associacao-card');
            const nomeAssociacao = card.getAttribute('data-associacao');
            console.log('Botão clicado:', nomeAssociacao);
            
            // Disparar evento customizado para o modal
            const event = new CustomEvent('associacaoButtonClick', {
                detail: { nomeAssociacao },
                bubbles: true
            });
            button.dispatchEvent(event);
        });
    });
}

function setupAssociationsAnimations() {
    const associacaoCards = document.querySelectorAll('.associacao-card');
    
    associacaoCards.forEach((card, index) => {
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
window.carregarAssociacoes = carregarAssociacoes;