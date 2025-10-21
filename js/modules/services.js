// js/modules/services.js
import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';

export function initializeServices() {
    const container = document.querySelector(SELECTORS.SERVICOS_CONTAINER);
    if (!container) {
        console.log('Container de serviços não encontrado');
        return;
    }

    carregarServicos();
}

export async function carregarServicos() {
    try {
        const response = await fetch(CONFIG.SERVICES_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvData = await response.text();
        const servicos = csvParaJSON(csvData);
        
        renderizarServicos(servicos);
        console.log('Serviços carregados:', servicos);
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
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
        .filter(servico => servico.Nome && servico.Nome.trim() !== '');
}

function getIconForService(serviceName) {
    const normalizeText = (text) => {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    };

    const normalizedName = normalizeText(serviceName);
    
    // Mapeamento específico para os seus serviços
    const specificIcons = {
        'atendimento ao publico': 'fas fa-user-headset',
        'atendimento publico': 'fas fa-user-headset',
        'emissao de documentos': 'fas fa-file-certificate', 
        'emissao documentos': 'fas fa-file-certificate',
        'apoio social': 'fas fa-hands-helping',
        'espacos publicos': 'fas fa-tree',
        'informacoes municipais': 'fas fa-info-circle',
        'apoio ao associativismo': 'fas fa-users'
    };

    // Verifica correspondência exata primeiro
    if (specificIcons[normalizedName]) {
        return specificIcons[normalizedName];
    }

    // Fallback para palavras-chave
    const keywordIcons = {
        'atendimento': 'fas fa-user-headset',
        'publico': 'fas fa-user-headset',
        'emissao': 'fas fa-file-certificate',
        'documento': 'fas fa-file-certificate',
        'social': 'fas fa-hands-helping',
        'apoio': 'fas fa-hands-helping',
        'espaco': 'fas fa-tree',
        'publicos': 'fas fa-tree',
        'jardim': 'fas fa-tree',
        'informacao': 'fas fa-info-circle',
        'municipal': 'fas fa-info-circle',
        'associativismo': 'fas fa-users',
        'associacao': 'fas fa-users'
    };

    // Procura por palavras-chave no nome
    for (const [keyword, icon] of Object.entries(keywordIcons)) {
        if (normalizedName.includes(keyword)) {
            return icon;
        }
    }

    // Ícone padrão
    return 'fas fa-cogs';
}

function renderizarServicos(servicos) {
    const container = document.querySelector(SELECTORS.SERVICOS_CONTAINER);
    if (!container) return;

    console.log('Renderizando serviços:', servicos);

    container.innerHTML = servicos.map(servico => {
        const icon = getIconForService(servico.Nome);
        
        return `
        <div class="servico-card card" data-servico="${servico.Nome}">
            <div class="card-icon">
                <i class="${icon}"></i>
            </div>
            <h3>${servico.Nome}</h3>
            <p>${servico.Descricao}</p>
        </div>
        `;
    }).join('');

    // Adicionar animações aos cards
    setupServicesAnimations();
}

function setupServicesAnimations() {
    const servicoCards = document.querySelectorAll('.servico-card');
    
    servicoCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(card);
    });
}

// Exportar para uso global se necessário
window.carregarServicos = carregarServicos;