// js/modules/rentals.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';

let espacos = [];
let ferramentas = [];
let categoriaAtual = 'espacos';

export function initializeRentals() {
    const container = document.querySelector('#alugueres-container');
    if (!container) return;

    carregarAlugueres();
    setupFilterTabs();
}

async function carregarAlugueres() {
    try {
        const [espacosResponse, ferramentasResponse] = await Promise.all([
            fetch(`${CONFIG.RENTALS_SHEET_URL}Espacos`),
            fetch(`${CONFIG.RENTALS_SHEET_URL}Ferramentas`)
        ]);

        if (!espacosResponse.ok || !ferramentasResponse.ok) {
            throw new Error('Erro ao carregar dados dos alugueres');
        }

        const espacosCSV = await espacosResponse.text();
        const ferramentasCSV = await ferramentasResponse.text();

        espacos = csvParaJSON(espacosCSV);
        ferramentas = csvParaJSON(ferramentasCSV);

        renderizarItens(espacos);
    } catch (error) {
        console.error('Erro ao carregar alugueres:', error);
        showNotification('Erro ao carregar itens para aluguer', 'error');
    }
}

function csvParaJSON(csv) {
    const linhas = csv.split('\n').filter(linha => linha.trim() !== '');
    if (linhas.length === 0) return [];
    
    const headers = linhas[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    return linhas.slice(1).map(linha => {
        const valores = linha.split(',').map(val => val.trim().replace(/"/g, ''));
        
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = valores[index] || '';
        });
        return obj;
    }).filter(item => item.Nome && item.Disponivel === 'Sim');
}

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            categoriaAtual = tab.dataset.category;
            
            if (categoriaAtual === 'espacos') {
                renderizarItens(espacos);
            } else {
                renderizarItens(ferramentas);
            }
        });
    });
}

function renderizarItens(itens) {
    const container = document.querySelector('#alugueres-container');
    if (!container) return;

    if (itens.length === 0) {
        container.innerHTML = `
            <div class="no-alugueres">
                <i class="fas fa-search"></i>
                <p>Nenhum item disponível para aluguer no momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = itens.map((item, index) => {
        const isEspaco = categoriaAtual === 'espacos';
        
        // Garantir descrição consistente
        const descricao = item.Descricao || 'Descrição não disponível';
        const descricaoCurta = descricao.length > 100 ? descricao.substring(0, 100) + '...' : descricao;
        
        const detalhesExtra = isEspaco ? 
            `<div class="item-meta"><strong>Capacidade:</strong> ${item.Capacidade || 'Não especificada'}</div>` :
            `<div class="item-meta"><strong>Categoria:</strong> ${item.Categoria || 'Geral'}</div>`;

        return `
        <div class="item-card" data-item-id="${index}">
            <div class="item-image">
                <img src="${item.Imagem || 'https://via.placeholder.com/400x200/2c5530/ffffff?text=Imagem'}" 
                     alt="${item.Nome}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x200/2c5530/ffffff?text=Imagem'">
            </div>
            <div class="item-content">
                <span class="item-badge">${isEspaco ? 'Espaço' : 'Ferramenta'}</span>
                <h3>${item.Nome}</h3>
                <p class="item-description">${descricaoCurta}</p>
                
                <div class="item-details">
                    ${detalhesExtra}
                </div>
                
                <button class="btn btn-small reservar-btn" 
                        data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                        data-categoria="${categoriaAtual}">
                    <i class="fas fa-calendar-check"></i> Reservar
                </button>
            </div>
        </div>
        `;
    }).join('');

    setupReservaButtons();
}

function setupReservaButtons() {
    const reservaBtns = document.querySelectorAll('.reservar-btn');
    
    reservaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemData = JSON.parse(btn.dataset.item.replace(/&apos;/g, "'"));
            const categoria = btn.dataset.categoria;
            abrirModalReserva(itemData, categoria);
        });
    });
}

function abrirModalReserva(item, categoria) {
    const modal = document.querySelector('#reserva-modal');
    const modalBody = document.querySelector('#reserva-modal-body');
    
    if (!modal || !modalBody) return;

    const hoje = new Date().toISOString().split('T')[0];

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Reservar ${item.Nome}</h2>
            <button class="modal-close" aria-label="Fechar modal">×</button>
        </div>
        <div class="modal-content-inner">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <span class="item-badge" style="font-size: 1rem; padding: 0.5rem 1.5rem;">
                    ${categoria === 'espacos' ? '🏛️ Espaço' : '🛠️ Ferramenta'}
                </span>
            </div>
            
            <form id="reserva-form" class="reserva-form">
                <input type="hidden" name="item_nome" value="${item.Nome}">
                <input type="hidden" name="categoria" value="${categoria}">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="reserva-nome">
                            <i class="fas fa-user"></i> Nome Completo *
                        </label>
                        <input type="text" id="reserva-nome" name="nome" required 
                               placeholder="Seu nome completo">
                    </div>
                    <div class="form-group">
                        <label for="reserva-email">
                            <i class="fas fa-envelope"></i> Email *
                        </label>
                        <input type="email" id="reserva-email" name="email" required 
                               placeholder="seu.email@exemplo.pt">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="reserva-telefone">
                            <i class="fas fa-phone"></i> Telefone *
                        </label>
                        <input type="tel" id="reserva-telefone" name="telefone" required 
                               placeholder="912 345 678">
                    </div>
                </div>
                
                <div class="date-inputs">
                    <div class="form-group">
                        <label for="data-inicio">
                            <i class="fas fa-calendar-plus"></i> Data de Início *
                        </label>
                        <input type="date" id="data-inicio" name="data_inicio" min="${hoje}" required>
                    </div>
                    <div class="form-group">
                        <label for="data-fim">
                            <i class="fas fa-calendar-minus"></i> Data de Fim *
                        </label>
                        <input type="date" id="data-fim" name="data_fim" min="${hoje}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="observacoes">
                        <i class="fas fa-comment"></i> Observações
                    </label>
                    <textarea id="observacoes" name="observacoes" rows="4" 
                              placeholder="Informações adicionais sobre a reserva, número de pessoas, tipo de evento, etc..."></textarea>
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="btn">
                        <i class="fas fa-paper-plane"></i> Enviar Pedido de Reserva
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 1.5rem;">
                    <small style="color: var(--text-light); font-size: 0.85rem;">
                        <i class="fas fa-info-circle"></i> Entraremos em contacto para confirmar a disponibilidade
                    </small>
                </div>
            </form>
        </div>
    `;

    // Configurar o botão de fechar
    const closeBtn = modalBody.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fecharModalReserva();
        });
    }

    // Mostrar modal
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);

    // Configurar validação de datas
    setupValidacaoDatas();
    setupReservaForm(item);
}

function setupValidacaoDatas() {
    const dataInicioInput = document.getElementById('data-inicio');
    const dataFimInput = document.getElementById('data-fim');

    function validarDatas() {
        const dataInicio = new Date(dataInicioInput.value);
        const dataFim = new Date(dataFimInput.value);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataInicio && dataInicio < hoje) {
            dataInicioInput.setCustomValidity('A data de início não pode ser no passado');
            return false;
        }

        if (dataInicio && dataFim && dataFim <= dataInicio) {
            dataFimInput.setCustomValidity('A data de fim deve ser após a data de início');
            return false;
        }

        dataInicioInput.setCustomValidity('');
        dataFimInput.setCustomValidity('');
        return true;
    }

    dataInicioInput.addEventListener('change', validarDatas);
    dataFimInput.addEventListener('change', validarDatas);
}

function setupReservaForm(item) {
    const form = document.getElementById('reserva-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const dadosReserva = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            item: formData.get('item_nome'),
            categoria: formData.get('categoria'),
            data_inicio: formData.get('data_inicio'),
            data_fim: formData.get('data_fim'),
            observacoes: formData.get('observacoes') || 'Nenhuma',
            data_pedido: new Date().toLocaleString('pt-PT')
        };

        try {
            await enviarEmailReserva(dadosReserva);
            fecharModalReserva();
            form.reset();
            showNotification('Pedido de reserva enviado com sucesso! Entraremos em contacto para confirmação.', 'success');
            
        } catch (error) {
            console.error('Erro no envio da reserva:', error);
            showNotification('Erro ao enviar pedido. Tente novamente ou contacte-nos diretamente.', 'error');
        }
    });
}

// FUNÇÃO PARA ENVIAR EMAIL
async function enviarEmailReserva(dadosReserva) {
    const response = await fetch('https://formsubmit.co/ajax/filipefg@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            _subject: `📋 NOVA RESERVA - ${dadosReserva.item}`,
            _template: 'table',
            _cc: dadosReserva.email,
            nome: dadosReserva.nome,
            email: dadosReserva.email,
            telefone: dadosReserva.telefone,
            item: dadosReserva.item,
            categoria: dadosReserva.categoria,
            data_inicio: dadosReserva.data_inicio,
            data_fim: dadosReserva.data_fim,
            observacoes: dadosReserva.observacoes,
            data_pedido: dadosReserva.data_pedido,
            estado: 'Pendente - Aguarda Confirmação'
        })
    });

    if (!response.ok) {
        throw new Error('Erro no envio do email');
    }

    return await response.json();
}

function fecharModalReserva() {
    const modal = document.querySelector('#reserva-modal');
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Event listeners para fechar modal
document.addEventListener('click', (e) => {
    const modal = document.querySelector('#reserva-modal');
    if (modal && e.target === modal) {
        fecharModalReserva();
    }
});

document.addEventListener('keydown', (e) => {
    const modal = document.querySelector('#reserva-modal');
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
        fecharModalReserva();
    }
});

// Exportar para uso global
window.initializeRentals = initializeRentals;