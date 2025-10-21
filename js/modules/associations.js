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

    container.innerHTML = associacoes.map(associacao => `
        <div class="associacao-card card" data-associacao="${associacao.Nome}">
            <div class="associacao-logo card-image">
                <img src="${associacao.Logo || 'https://via.placeholder.com/150x150/2c5530/ffffff?text=LOGO'}" 
                     alt="Logo ${associacao.Nome}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/150x150/2c5530/ffffff?text=LOGO'">
            </div>
            <h3>${associacao.Nome}</h3>
            <p>${associacao.Descricao || 'Descrição não disponível'}</p>
            <button class="btn-associacao btn btn-small" 
                    aria-label="Mais informações sobre ${associacao.Nome}">
                Mais Informações
            </button>
        </div>
    `).join('');

    // Configurar event listeners apenas para os botões
    setupAssociationsButtons();
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