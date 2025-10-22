// js/modules/calendar.js

import { SELECTORS, CONFIG } from '../utils/constants.js';
import { showNotification } from '../utils/helpers.js';

// Variáveis globais
let todosEventos = [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

export function initializeCalendar() {
    console.log('🎯 Inicializando calendário...');
    
    const container = document.querySelector(SELECTORS.CALENDAR_SECTION);
    if (!container) {
        console.log('❌ Secção do calendário não encontrada');
        return;
    }

    carregarEventos();
    setupCalendarNavigation();
    
    console.log('✅ Calendário inicializado');
}

export async function carregarEventos() {
    try {
        console.log('📥 A carregar eventos do Google Sheets...');
        
        const response = await fetch(CONFIG.CALENDAR_SHEET_URL);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const csvData = await response.text();
        console.log('📄 Dados CSV recebidos:', csvData);
        
        const eventos = csvParaJSON(csvData);
        console.log('🔄 Eventos processados:', eventos);
        
        todosEventos = processarEventos(eventos);
        renderizarCalendario();
        renderizarProximosEventos();
        
        console.log('✅ Eventos carregados:', todosEventos.length, 'eventos');
        
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
    }
}

function csvParaJSON(csv) {
    const linhas = csv.split('\n').filter(linha => linha.trim() !== '');
    
    if (linhas.length < 2) {
        return [];
    }
    
    const headers = linhas[0].split(',').map(header => 
        header.trim().replace(/"/g, '')
    );
    
    console.log('📋 Headers encontrados:', headers);
    
    const eventos = linhas.slice(1)
        .map((linha, index) => {
            // Método mais robusto para parsing CSV
            const valores = linha.split(',').map(val => 
                val.trim().replace(/"/g, '')
            );
            
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = valores[i] || '';
            });
            
            // Log para debug
            if (index < 3) {
                console.log(`📝 Linha ${index + 1}:`, obj);
            }
            
            return obj;
        })
        .filter(evento => evento.Titulo && evento.Titulo.trim() !== '');
    
    console.log(`📊 Total de eventos válidos: ${eventos.length}`);
    return eventos;
}

function processarEventos(eventos) {
    return eventos.map(evento => {
        // Corrigir formato da data - tentar vários formatos
        let dataEvento;
        try {
            dataEvento = new Date(evento.Data);
            if (isNaN(dataEvento.getTime())) {
                // Tentar formato DD/MM/YYYY
                const [dia, mes, ano] = evento.Data.split('/');
                dataEvento = new Date(ano, mes - 1, dia);
            }
        } catch (e) {
            console.error('❌ Erro a processar data:', evento.Data);
            dataEvento = new Date(); // Data atual como fallback
        }

        const [hora, minuto] = evento.Hora_Inicio ? evento.Hora_Inicio.split(':') : [0, 0];
        
        return {
            ...evento,
            data: dataEvento,
            dataISO: evento.Data,
            horaInicio: evento.Hora_Inicio,
            timestamp: dataEvento.getTime(),
            dia: dataEvento.getDate(),
            mes: dataEvento.getMonth(),
            ano: dataEvento.getFullYear(),
            hora: parseInt(hora),
            minuto: parseInt(minuto),
            categoria: evento.Categoria || 'Geral',
            corCategoria: getCorCategoria(evento.Categoria)
        };
    }).sort((a, b) => a.timestamp - b.timestamp);
}

function getCorCategoria(categoria) {
    const cores = {
        'Cultural': '#e74c3c',
        'Cívico': '#3498db',
        'Comercial': '#2ecc71',
        'Desporto': '#f39c12',
        'Religioso': '#9b59b6',
        'Educação': '#1abc9c',
        'Social': '#e67e22',
        'Geral': '#95a5a6'
    };
    return cores[categoria] || '#95a5a6';
}

function setupCalendarNavigation() {
    const prevBtn = document.querySelector('.prev-month');
    const nextBtn = document.querySelector('.next-month');
    const todayBtn = document.querySelector('.today-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            mesAtual--;
            if (mesAtual < 0) {
                mesAtual = 11;
                anoAtual--;
            }
            renderizarCalendario();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            mesAtual++;
            if (mesAtual > 11) {
                mesAtual = 0;
                anoAtual++;
            }
            renderizarCalendario();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            const hoje = new Date();
            mesAtual = hoje.getMonth();
            anoAtual = hoje.getFullYear();
            renderizarCalendario();
        });
    }
}

function renderizarCalendario() {
    const calendarGrid = document.querySelector(SELECTORS.CALENDAR_GRID);
    const calendarHeader = document.querySelector('.calendario-header h3');
    
    if (!calendarGrid) {
        console.error('❌ Elemento do calendário não encontrado');
        return;
    }

    // DEBUG: Verificar valores atuais
    console.log('🔍 DEBUG - mesAtual:', mesAtual, 'anoAtual:', anoAtual);
    console.log('🔍 DEBUG - Nome do mês:', getNomeMes(mesAtual));

    // ATUALIZAR CABEÇALHO COM MÊS E ANO CORRETOS
    const nomeMes = getNomeMes(mesAtual);
    if (calendarHeader) {
        calendarHeader.textContent = `${nomeMes} ${anoAtual}`;
        console.log('✅ Cabeçalho atualizado para:', nomeMes, anoAtual);
    }

    // Gerar dias do mês - SEMANA COMEÇA NA SEGUNDA
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    
    // Ajustar para semana começar na segunda (0=Domingo, 1=Segunda, etc.)
    let diaInicio = primeiroDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6; // Domingo vai para o final

    // CALCULAR TOTAL DE LINHAS NECESSÁRIAS (sempre 6 linhas)
    const totalDiasNecessarios = 42; // 6 linhas × 7 dias = 42 células
    const diasVaziosFinais = totalDiasNecessarios - (diaInicio + diasNoMes);

    let calendarioHTML = '';

    // Dias da semana - SEGUNDA PRIMEIRO
    calendarioHTML += `
        <div class="calendar-weekdays">
            <div class="weekday">Seg</div>
            <div class="weekday">Ter</div>
            <div class="weekday">Qua</div>
            <div class="weekday">Qui</div>
            <div class="weekday">Sex</div>
            <div class="weekday">Sáb</div>
            <div class="weekday">Dom</div>
        </div>
        <div class="calendar-days">
    `;

    // Dias vazios no início
    for (let i = 0; i < diaInicio; i++) {
        calendarioHTML += `<div class="calendar-day empty"></div>`;
    }

    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const eventosDia = getEventosPorDia(dia, mesAtual, anoAtual);
        const hoje = new Date();
        const isHoje = dia === hoje.getDate() && 
                      mesAtual === hoje.getMonth() && 
                      anoAtual === hoje.getFullYear();
        
        calendarioHTML += `
            <div class="calendar-day ${isHoje ? 'today' : ''}" 
                 data-dia="${dia}" data-mes="${mesAtual}" data-ano="${anoAtual}">
                <span class="day-number">${dia}</span>
                <div class="day-events-scroll">
                    ${eventosDia.slice(0, 5).map(evento => `
                        <div class="event-indicator" 
                             style="background-color: ${evento.corCategoria}"
                             title="${evento.Titulo} - ${evento.horaInicio}">
                            ${evento.Titulo.substring(0, 10)}...
                        </div>
                    `).join('')}
                    ${eventosDia.length > 5 ? `
                        <div class="event-more">+${eventosDia.length - 5} mais</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Dias vazios no final para completar 6 linhas
    for (let i = 0; i < diasVaziosFinais; i++) {
        calendarioHTML += `<div class="calendar-day empty"></div>`;
    }

    calendarioHTML += `</div>`;
    calendarGrid.innerHTML = calendarioHTML;

    // Adicionar event listeners aos dias
    setupDayClickEvents();
    
    console.log('✅ Calendário renderizado para', nomeMes, anoAtual, '- 6 linhas');
}

function getEventosPorDia(dia, mes, ano) {
    return todosEventos.filter(evento => 
        evento.dia === dia && 
        evento.mes === mes && 
        evento.ano === ano
    );
}

function setupDayClickEvents() {
    const days = document.querySelectorAll('.calendar-day:not(.empty)');
    
    days.forEach(day => {
        day.addEventListener('click', () => {
            const dia = parseInt(day.getAttribute('data-dia'));
            const mes = parseInt(day.getAttribute('data-mes'));
            const ano = parseInt(day.getAttribute('data-ano'));
            
            const eventosDia = getEventosPorDia(dia, mes, ano);
            abrirModalDia(eventosDia, dia, mes, ano);
        });
    });
}

function abrirModalDia(eventos, dia, mes, ano) {
    const modal = document.querySelector(SELECTORS.CALENDAR_MODAL);
    const modalBody = document.querySelector(SELECTORS.CALENDAR_MODAL_BODY);
    
    if (!modal || !modalBody) {
        console.error('❌ Modal do calendário não encontrado');
        return;
    }

    const nomeMes = getNomeMes(mes);
    
    modalBody.innerHTML = `
        <div class="modal-day-header">
            <h3>${dia} de ${nomeMes} de ${ano}</h3>
            <p>${eventos.length} evento(s) marcado(s)</p>
        </div>
        <div class="day-events-list">
            ${eventos.length > 0 ? eventos.map(evento => `
                <div class="event-detail-card" style="border-left-color: ${evento.corCategoria}">
                    <div class="event-time">
                        <i class="fas fa-clock"></i>
                        ${evento.horaInicio || 'Horário a definir'}
                    </div>
                    <h4>${evento.Titulo}</h4>
                    <p class="event-category">
                        <span class="category-badge" style="background-color: ${evento.corCategoria}">
                            ${evento.categoria}
                        </span>
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${evento.Local || 'Local a definir'}
                    </p>
                    <p class="event-description">${evento.Descricao || 'Sem descrição disponível.'}</p>
                </div>
            `).join('') : `
                <div class="no-events-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>Nenhum evento marcado para este dia.</p>
                </div>
            `}
        </div>
    `;

    // Mostrar modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Fechar modal
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => fecharModalCalendario();
    }
}

function fecharModalCalendario() {
    const modal = document.querySelector(SELECTORS.CALENDAR_MODAL);
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }, 300);
}

function renderizarProximosEventos() {
    const container = document.querySelector(SELECTORS.UPCOMING_EVENTS);
    if (!container) {
        console.error('❌ Container de próximos eventos não encontrado');
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Ignorar horas para comparação

    const eventosFuturos = todosEventos
        .filter(evento => evento.data >= hoje)
        .slice(0, 5); // Próximos 5 eventos

    container.innerHTML = eventosFuturos.length > 0 ? eventosFuturos.map(evento => `
        <div class="upcoming-event-card">
            <div class="event-date-badge">
                <span class="event-day">${evento.dia}</span>
                <span class="event-month">${getNomeMesAbreviado(evento.mes)}</span>
            </div>
            <div class="event-preview">
                <h4>${evento.Titulo}</h4>
                <p class="event-time-location">
                    <i class="fas fa-clock"></i> ${evento.horaInicio} 
                    <i class="fas fa-map-marker-alt"></i> ${evento.Local}
                </p>
                <span class="event-category-tag" style="background-color: ${evento.corCategoria}">
                    ${evento.categoria}
                </span>
            </div>
        </div>
    `).join('') : `
        <div class="no-upcoming-events">
            <p>Não há eventos futuros marcados.</p>
        </div>
    `;
    
    console.log('📋 Próximos eventos renderizados:', eventosFuturos.length);
}

// Funções auxiliares
function getNomeMes(mes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes];
}

function getNomeMesAbreviado(mes) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[mes];
}

function carregarEventosExemplo() {
    console.log('🔄 Carregando eventos de exemplo...');
    
    // Eventos de exemplo para teste
    const eventosExemplo = [
        {
            Data: new Date().toISOString().split('T')[0],
            Titulo: 'Reunião da Junta de Freguesia',
            Categoria: 'Cívico',
            Local: 'Salão da Junta',
            Hora_Inicio: '18:00',
            Descricao: 'Reunião mensal do executivo da Junta de Freguesia.'
        },
        {
            Data: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
            Titulo: 'Feira Mensal',
            Categoria: 'Comercial', 
            Local: 'Praça Central',
            Hora_Inicio: '08:00',
            Descricao: 'Feira tradicional com produtos locais.'
        }
    ];
    
    todosEventos = processarEventos(eventosExemplo);
    renderizarCalendario();
    renderizarProximosEventos();
    
    console.log('✅ Eventos de exemplo carregados');
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    const modal = document.querySelector(SELECTORS.CALENDAR_MODAL);
    if (modal && e.target === modal) {
        fecharModalCalendario();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    const modal = document.querySelector(SELECTORS.CALENDAR_MODAL);
    if (modal && modal.style.display === 'block' && e.key === 'Escape') {
        fecharModalCalendario();
    }
});