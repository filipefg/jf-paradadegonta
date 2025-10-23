// js/modules/search.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { debounce, showNotification } from '../utils/helpers.js';

export class SimpleSearch {
    constructor() {
        this.isInitialized = false;
        this.searchData = [];
        this.isOpen = false;
        this.init();
    }

    async init() {
        try {
            await this.loadSearchData();
            this.createSearchInMenu();
            this.isInitialized = true;
            console.log('🔍 Sistema de pesquisa no menu inicializado');
        } catch (error) {
            console.error('Erro ao inicializar pesquisa:', error);
        }
    }

    async loadSearchData() {
        const [noticias, documentos, associacoes, servicos, espacos, ferramentas] = await Promise.all([
            this.fetchData(CONFIG.NEWS_SHEET_URL, 'news'),
            this.fetchData(CONFIG.DOCUMENTS_SHEET_URL, 'documents'),
            this.fetchData(CONFIG.ASSOCIATIONS_SHEET_URL, 'associations'),
            this.fetchData(CONFIG.SERVICES_SHEET_URL, 'services'),
            this.fetchData(`${CONFIG.RENTALS_SHEET_URL}Espacos`, 'espacos'),
            this.fetchData(`${CONFIG.RENTALS_SHEET_URL}Ferramentas`, 'ferramentas')
        ]);

        this.searchData = [...noticias, ...documentos, ...associacoes, ...servicos, ...espacos, ...ferramentas];
    }

    async fetchData(url, type) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvData = await response.text();
            const items = this.csvToJSON(csvData);
            
            return items.map(item => ({
                id: `${type}_${item.Titulo || item.Nome}`,
                title: item.Titulo || item.Nome,
                content: item.Descricao || item.Conteudo || '',
                type: this.getTypeLabel(type),
                url: this.getTypeUrl(type),
                icon: this.getTypeIcon(type),
                date: item.Data
            }));
        } catch (error) {
            console.error(`Erro ao carregar ${type}:`, error);
            return [];
        }
    }

    getTypeLabel(type) {
        const labels = {
            'news': 'Notícia',
            'documents': 'Documento', 
            'associations': 'Associação',
            'services': 'Serviço',
            'espacos': 'Espaço para Aluguer',
            'ferramentas': 'Ferramenta para Aluguer'
        };
        return labels[type] || 'Item';
    }

    getTypeUrl(type) {
        const urls = {
            'news': '#noticias',
            'documents': '#documentos',
            'associations': '#associativismo', 
            'services': '#servicos',
            'espacos': '#alugueres',
            'ferramentas': '#alugueres'
        };
        return urls[type] || '#';
    }

    getTypeIcon(type) {
        const icons = {
            'news': 'far fa-newspaper',
            'documents': 'far fa-file-alt',
            'associations': 'fas fa-users',
            'services': 'fas fa-concierge-bell',
            'espacos': 'fas fa-building',
            'ferramentas': 'fas fa-tools'
        };
        return icons[type] || 'fas fa-circle';
    }

    csvToJSON(csv) {
        const linhas = csv.split('\n').filter(linha => linha.trim() !== '');
        if (linhas.length === 0) return [];
        
        const headers = linhas[0].split(',').map(header => 
            header.trim().replace(/"/g, '')
        );
        
        return linhas.slice(1).map(linha => {
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
        }).filter(item => item.Titulo || item.Nome);
    }

    createSearchInMenu() {
        const searchHTML = `
            <li class="menu-search-item">
                <button class="menu-search-btn" aria-label="Abrir pesquisa">
                    <i class="fas fa-search"></i>
                </button>
                
                <div class="search-overlay" style="display: none;">
                    <div class="search-modal">
                        <div class="search-header">
                            <h3>Pesquisar no site</h3>
                            <button class="search-close" aria-label="Fechar pesquisa">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="search-input-container">
                            <input type="text" 
                                   class="search-input" 
                                   placeholder="Digite para pesquisar..."
                                   aria-label="Pesquisar no site">
                            <button class="search-clear" aria-label="Limpar pesquisa" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="search-submit" aria-label="Pesquisar">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                        
                        <div class="search-results"></div>
                    </div>
                </div>
            </li>
        `;

        const navMenu = document.querySelector(SELECTORS.NAV_MENU);
        if (navMenu) {
            navMenu.insertAdjacentHTML('beforeend', searchHTML);
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        const menuSearchBtn = document.querySelector('.menu-search-btn');
        const searchOverlay = document.querySelector('.search-overlay');
        const searchClose = document.querySelector('.search-close');
        const searchInput = document.querySelector('.search-input');
        const searchClear = document.querySelector('.search-clear');
        const searchSubmit = document.querySelector('.search-submit');

        if (!menuSearchBtn || !searchOverlay || !searchClose || !searchInput) {
            console.error('Elementos de pesquisa não encontrados');
            return;
        }

        menuSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSearch();
        });

        searchClose.addEventListener('click', () => {
            this.closeSearch();
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                this.closeSearch();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSearch();
            }
        });

        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            this.toggleClearButton(query);
            this.handleSearch(query);
        }, 300));

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.focus();
                this.toggleClearButton('');
                this.clearResults();
            });
        }

        if (searchSubmit) {
            searchSubmit.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(searchInput.value);
            }
        });
    }

    openSearch() {
        const searchOverlay = document.querySelector('.search-overlay');
        const searchInput = document.querySelector('.search-input');
        
        if (!searchOverlay || !searchInput) return;

        searchOverlay.style.display = 'flex';
        setTimeout(() => {
            searchOverlay.classList.add('active');
            searchInput.focus();
        }, 10);
        
        this.isOpen = true;
    }

    closeSearch() {
        const searchOverlay = document.querySelector('.search-overlay');
        const searchInput = document.querySelector('.search-input');
        const searchClear = document.querySelector('.search-clear');
        
        if (!searchOverlay || !searchInput) return;

        searchOverlay.classList.remove('active');
        setTimeout(() => {
            searchOverlay.style.display = 'none';
            searchInput.value = '';
            if (searchClear) {
                searchClear.style.display = 'none';
            }
            this.clearResults();
        }, 300);
        
        this.isOpen = false;
    }

    toggleClearButton(query) {
        const searchClear = document.querySelector('.search-clear');
        if (searchClear) {
            if (query.trim()) {
                searchClear.style.display = 'flex';
            } else {
                searchClear.style.display = 'none';
            }
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.clearResults();
            return;
        }

        if (!this.isInitialized) {
            showNotification('Sistema de pesquisa a carregar...', 'info');
            return;
        }

        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        
        if (searchTerms.length === 0) return [];

        return this.searchData
            .map(item => {
                const searchText = `${item.title} ${item.content}`.toLowerCase();
                const matches = searchTerms.filter(term => searchText.includes(term));
                const score = matches.length;
                
                return {
                    ...item,
                    score,
                    matches
                };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
    }

    displayResults(results, query) {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Nenhum resultado para "<strong>${query}</strong>"</p>
                    <small>Tente palavras-chave diferentes</small>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result" data-url="${result.url}">
                <div class="result-icon">
                    <i class="${result.icon}"></i>
                </div>
                <div class="result-content">
                    <h4 class="result-title">${this.highlightText(result.title, query)}</h4>
                    <p class="result-preview">${this.highlightText(
                        result.content.substring(0, 100) + (result.content.length > 100 ? '...' : ''), 
                        query
                    )}</p>
                    <span class="result-type">${result.type}</span>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;

        searchResults.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const url = result.getAttribute('data-url');
                this.navigateToResult(url);
            });
        });
    }

    clearResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    highlightText(text, query) {
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        let highlighted = text;
        
        terms.forEach(term => {
            const regex = new RegExp(term, 'gi');
            highlighted = highlighted.replace(regex, 
                match => `<mark class="search-highlight">${match}</mark>`
            );
        });
        
        return highlighted;
    }

    navigateToResult(url) {
        this.closeSearch();
        
        if (url.startsWith('#')) {
            const targetSection = document.querySelector(url);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 400);
            }
        }
    }
}

let searchInstance = null;

export function initializeSearch() {
    if (!searchInstance) {
        searchInstance = new SimpleSearch();
    }
    return searchInstance;
}