// js/modules/documents.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';
import { setCurrentDocuments } from './modals.js';

let todosDocumentos = [];
let categoriasUnicas = [];
let anosUnicos = [];

export function initializeDocuments() {
    const container = document.querySelector(SELECTORS.DOCUMENTOS_CONTAINER);
    if (!container) {
        console.log('Container de documentos não encontrado');
        return;
    }

    carregarDocumentos();
}

export async function carregarDocumentos() {
    try {
        console.log('📥 A carregar documentos...');
        const response = await fetch(CONFIG.DOCUMENTS_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvData = await response.text();
        const documentos = csvParaJSON(csvData);
        
        todosDocumentos = documentos;
        setCurrentDocuments(documentos); // ← DEFINIR NO MODALS
        extrairFiltros(documentos);
        renderizarFiltros();
        renderizarDocumentos(documentos);
        console.log('✅ Documentos carregados:', documentos.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar documentos:', error);
        showNotification('Erro ao carregar documentos', 'error');
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
            
            // Extrair ano da data se existir
            if (obj.Data) {
                const data = new Date(obj.Data);
                if (!isNaN(data.getTime())) {
                    obj.Ano = data.getFullYear().toString();
                }
            }
            
            return obj;
        })
        .filter(doc => doc.Titulo && doc.Titulo.trim() !== '');
}

function extrairFiltros(documentos) {
    // Extrair categorias únicas
    const categorias = documentos.map(doc => doc.Tipo).filter(Boolean);
    categoriasUnicas = [...new Set(categorias)].sort();
    
    // Extrair anos únicos
    const anos = documentos.map(doc => doc.Ano).filter(Boolean);
    anosUnicos = [...new Set(anos)].sort((a, b) => b - a);

    console.log('📊 Filtros extraídos:', { categoriasUnicas, anosUnicos });
}

function renderizarFiltros() {
    const filtersContainer = document.querySelector('#documentos-filters');
    if (!filtersContainer) return;

    filtersContainer.innerHTML = `
        <div class="filters-grid">
            <div class="filter-group">
                <label for="categoria-filter">Filtrar por Categoria:</label>
                <select id="categoria-filter" class="filter-select">
                    <option value="">Todas as Categorias</option>
                    ${categoriasUnicas.map(categoria => 
                        `<option value="${categoria}">${categoria}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="filter-group">
                <label for="ano-filter">Filtrar por Ano:</label>
                <select id="ano-filter" class="filter-select">
                    <option value="">Todos os Anos</option>
                    ${anosUnicos.map(ano => 
                        `<option value="${ano}">${ano}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="filter-actions">
                <button id="limpar-filtros" class="btn btn-secondary btn-small">
                    <i class="fas fa-times"></i> Limpar Filtros
                </button>
                <div id="documentos-count" class="documentos-count">
                    <span id="documentos-num">${todosDocumentos.length}</span> documentos encontrados
                </div>
            </div>
        </div>
    `;

    setupFiltersEvents();
}

function setupFiltersEvents() {
    const categoriaFilter = document.getElementById('categoria-filter');
    const anoFilter = document.getElementById('ano-filter');
    const limparFiltros = document.getElementById('limpar-filtros');

    if (categoriaFilter) {
        categoriaFilter.addEventListener('change', aplicarFiltros);
    }

    if (anoFilter) {
        anoFilter.addEventListener('change', aplicarFiltros);
    }

    if (limparFiltros) {
        limparFiltros.addEventListener('click', limparFiltrosHandler);
    }
}

function aplicarFiltros() {
    const categoriaSelecionada = document.getElementById('categoria-filter')?.value || '';
    const anoSelecionado = document.getElementById('ano-filter')?.value || '';

    let documentosFiltrados = [...todosDocumentos];

    // Aplicar filtro de categoria
    if (categoriaSelecionada) {
        documentosFiltrados = documentosFiltrados.filter(doc => 
            doc.Tipo === categoriaSelecionada
        );
    }

    // Aplicar filtro de ano
    if (anoSelecionado) {
        documentosFiltrados = documentosFiltrados.filter(doc => 
            doc.Ano === anoSelecionado
        );
    }

    console.log(`🔍 Filtros aplicados - Categoria: ${categoriaSelecionada}, Ano: ${anoSelecionado}`);
    console.log(`📄 Documentos filtrados: ${documentosFiltrados.length} de ${todosDocumentos.length}`);

    renderizarDocumentos(documentosFiltrados);
    atualizarContador(documentosFiltrados.length);
}

function limparFiltrosHandler() {
    const categoriaFilter = document.getElementById('categoria-filter');
    const anoFilter = document.getElementById('ano-filter');

    if (categoriaFilter) categoriaFilter.value = '';
    if (anoFilter) anoFilter.value = '';

    aplicarFiltros();
    showNotification('Filtros limpos com sucesso', 'success');
}

function atualizarContador(numero) {
    const contador = document.getElementById('documentos-num');
    if (contador) {
        contador.textContent = numero;
    }
}

function formatarData(dataString) {
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) {
            return '';
        }
        
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return data.toLocaleDateString('pt-PT', options);
    } catch (error) {
        return '';
    }
}

function renderizarDocumentos(documentos) {
    const container = document.querySelector(SELECTORS.DOCUMENTOS_CONTAINER);
    if (!container) return;

    console.log('🎨 Renderizando documentos:', documentos.length);

    if (documentos.length === 0) {
        container.innerHTML = `
            <div class="no-documents-message" style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-light); font-size: 1.1rem;">
                    Nenhum documento encontrado com os filtros selecionados.
                </p>
                <button class="btn btn-small" onclick="window.limparFiltrosHandler && window.limparFiltrosHandler()" style="margin-top: 1rem;">
                    Limpar Filtros
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = documentos.map(documento => {
        const dataFormatada = formatarData(documento.Data);
        const descricao = documento.Descricao || 'Documento oficial da Junta de Freguesia';
        
        return `
        <div class="documento-card card" data-documento="${documento.Titulo}" data-categoria="${documento.Tipo}" data-ano="${documento.Ano || ''}">
            <div class="documento-content">
                <h3>${documento.Titulo}</h3>
                ${dataFormatada ? `<div class="documento-date">${dataFormatada}</div>` : ''}
                <p>${descricao}</p>
                ${documento.Link ? `
                    <a href="${documento.Link}" class="btn-documento btn btn-small" target="_blank" 
                       aria-label="Abrir documento ${documento.Titulo}">
                        Abrir Documento <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : `
                    <button class="btn-documento btn btn-small" 
                            data-documento-titulo="${documento.Titulo}"
                            aria-label="Ver detalhes do documento ${documento.Titulo}">
                        Ver Detalhes
                    </button>
                `}
            </div>
        </div>
        `;
    }).join('');

    // REMOVER: Não precisa mais de setupDocumentsButtons
    // Os event listeners são agora globais no modals.js
    
    setupDocumentsAnimations();
}

// REMOVER COMPLETAMENTE: 
// - setupDocumentsButtons()
// - abrirModalDocumento()
// - generateModalContent()

function setupDocumentsAnimations() {
    const documentoCards = document.querySelectorAll('.documento-card');
    
    documentoCards.forEach((card, index) => {
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

// Exportar para uso global
window.carregarDocumentos = carregarDocumentos;
window.limparFiltrosHandler = limparFiltrosHandler;