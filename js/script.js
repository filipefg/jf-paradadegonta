// script.js

// Menu mobile toggle e funcionalidades principais
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.querySelector('body');
    const header = document.querySelector('.header');
    
    // Estado do menu
    let isMenuOpen = false;

    // Menu mobile toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            isMenuOpen = !isMenuOpen;
            
            // Alternar menu
            navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', isMenuOpen);
            
            // Controlar overflow do body
            body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
            
            // Animação do ícone do menu (hamburger para X)
            const spans = this.querySelectorAll('span');
            if (isMenuOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Fechar menu ao clicar num link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Fechar menu mobile se estiver aberto
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                body.style.overflow = 'auto';
                isMenuOpen = false;
                
                // Reset do ícone do menu
                if (navToggle) {
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
            
            // Scroll suave para âncoras na mesma página
            if (this.getAttribute('href').startsWith('#') && 
                !this.getAttribute('href').includes('.html')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Atualizar URL sem recarregar a página
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
    
    // Fechar menu ao redimensionar a janela
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                body.style.overflow = 'auto';
                isMenuOpen = false;
                
                if (navToggle) {
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        }, 250);
    });
    
    // Header scroll effect
    if (header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            // Efeito de reduzir padding no scroll
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Efeito de hide/show no scroll (opcional)
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                // Scroll para baixo - esconder header
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scroll para cima - mostrar header
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    // Botão de limpar formulário
    const btnLimpar = document.getElementById('btnLimpar');
    const contactForm = document.getElementById('contactForm');
    
    if (btnLimpar && contactForm) {
        btnLimpar.addEventListener('click', function() {
            if (confirm('Tem a certeza que pretende limpar o formulário? Todos os dados inseridos serão perdidos.')) {
                contactForm.reset();
                
                // Mostrar feedback visual
                showFormMessage('Formulário limpo com sucesso.', 'success');
            }
        });
    }
    
    // Validação do formulário de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos
            const nome = document.getElementById('nome');
            const telefone = document.getElementById('telefone');
            const mensagem = document.getElementById('mensagem');
            
            let isValid = true;
            
            // Reset de erros anteriores
            clearFormErrors();
            
            // Validar nome
            if (!nome.value.trim()) {
                showFieldError(nome, 'Por favor, insira o seu nome.');
                isValid = false;
            }
            
            // Validar mensagem
            if (!mensagem.value.trim()) {
                showFieldError(mensagem, 'Por favor, insira a sua mensagem.');
                isValid = false;
            }
            
            if (isValid) {
                // Mostrar estado de carregamento
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'A enviar...';
                submitBtn.disabled = true;
                
                // Simular envio (substituir pela lógica real do FormSubmit)
                setTimeout(() => {
                    contactForm.submit();
                    showFormMessage('Mensagem enviada com sucesso! Entraremos em contacto brevemente.', 'success');
                    contactForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    // Animação de entrada dos elementos ao scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        });
    }, observerOptions);
    
    // Elementos para animar
    const animateElements = document.querySelectorAll(
        '.servico-card, .noticia-card, .sobre-content > div, .contactos-content > div, ' +
        '.associacao-card, .documento-card, .atividade-card, .membro-card'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        observer.observe(el);
    });
    
    // Lazy loading para imagens
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Atualizar ano no footer
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.footer-bottom p');
    yearElements.forEach(element => {
        if (element.textContent.includes('2023') || element.textContent.includes('2024')) {
            element.innerHTML = element.innerHTML.replace(/(2023|2024)/g, currentYear.toString());
        }
    });
    
    // Adicionar funcionalidade de pesquisa (se necessário)
    initializeSearch();
    
    // Melhorar acessibilidade do menu
    improveMenuAccessibility();
    
    // Inicializar funcionalidades específicas da página
    initializePageSpecificFeatures();
});

// Funções auxiliares
function showFormMessage(message, type) {
    // Remover mensagens anteriores
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    
    // Inserir após o formulário
    const form = document.getElementById('contactForm');
    if (form) {
        form.appendChild(messageDiv);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remover mensagens de erro anteriores
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    
    field.parentNode.appendChild(errorDiv);
}

function clearFormErrors() {
    // Remover classes de erro
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    // Remover mensagens de erro
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
}

function initializeSearch() {
    // Implementar funcionalidade de pesquisa se necessário
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            // Implementar pesquisa em tempo real
            console.log('Pesquisar:', e.target.value);
        });
    }
}

function improveMenuAccessibility() {
    // Melhorar acessibilidade do menu
    const menuItems = document.querySelectorAll('.nav-menu a');
    menuItems.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        
        // Navegação por teclado no menu
        item.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    const nextItem = menuItems[index + 1] || menuItems[0];
                    nextItem.focus();
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    const prevItem = menuItems[index - 1] || menuItems[menuItems.length - 1];
                    prevItem.focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    menuItems[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    menuItems[menuItems.length - 1].focus();
                    break;
            }
        });
    });
}

function initializePageSpecificFeatures() {
    // Inicializar funcionalidades específicas baseadas na página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'noticias.html':
            initializeNewsPagination();
            break;
        case 'documentos.html':
            initializeDocumentFilters();
            break;
        case 'associacoes/adrc-parada-gonta.html':
        case 'associacoes/amigos-parada-gonta.html':
        case 'associacoes/assodrec.html':
        case 'associacoes/clube-caca-pesca.html':
        case 'associacoes/rancho-folclorico.html':
            initializeAssociationGallery();
            break;
    }
}

function initializeNewsPagination() {
    // Implementar paginação para a página de notícias
    const newsItems = document.querySelectorAll('.noticia-completa');
    const itemsPerPage = 3;
    let currentPage = 1;
    
    if (newsItems.length > itemsPerPage) {
        createPaginationControls(newsItems.length, itemsPerPage);
        showPage(1, newsItems, itemsPerPage);
    }
}

function createPaginationControls(totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.querySelector('.paginacao');
    
    if (paginationContainer) {
        let paginationHTML = '';
        
        // Botão anterior
        paginationHTML += '<a href="#" class="pagination-prev" aria-label="Página anterior">&laquo;</a>';
        
        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<a href="#" class="pagination-page ${i === 1 ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        
        // Botão seguinte
        paginationHTML += '<a href="#" class="pagination-next" aria-label="Página seguinte">&raquo;</a>';
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Event listeners para paginação
        paginationContainer.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (e.target.classList.contains('pagination-page')) {
                const page = parseInt(e.target.dataset.page);
                showPage(page, document.querySelectorAll('.noticia-completa'), itemsPerPage);
                updatePaginationUI(page, totalPages);
            } else if (e.target.classList.contains('pagination-prev')) {
                const currentPage = parseInt(document.querySelector('.pagination-page.active').dataset.page);
                if (currentPage > 1) {
                    showPage(currentPage - 1, document.querySelectorAll('.noticia-completa'), itemsPerPage);
                    updatePaginationUI(currentPage - 1, totalPages);
                }
            } else if (e.target.classList.contains('pagination-next')) {
                const currentPage = parseInt(document.querySelector('.pagination-page.active').dataset.page);
                if (currentPage < totalPages) {
                    showPage(currentPage + 1, document.querySelectorAll('.noticia-completa'), itemsPerPage);
                    updatePaginationUI(currentPage + 1, totalPages);
                }
            }
        });
    }
}

function showPage(pageNumber, items, itemsPerPage) {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    items.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function updatePaginationUI(currentPage, totalPages) {
    const pages = document.querySelectorAll('.pagination-page');
    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    
    pages.forEach(page => {
        page.classList.remove('active');
        if (parseInt(page.dataset.page) === currentPage) {
            page.classList.add('active');
        }
    });
    
    // Atualizar estado dos botões anterior/seguinte
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === totalPages);
}

function initializeDocumentFilters() {
    // Implementar filtros para a página de documentos
    const filterButtons = document.querySelectorAll('.document-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Atualizar UI
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar documentos
            filterDocuments(filter);
        });
    });
}

function filterDocuments(filter) {
    const documents = document.querySelectorAll('.documento-item');
    
    documents.forEach(doc => {
        if (filter === 'all' || doc.dataset.category === filter) {
            doc.style.display = 'flex';
        } else {
            doc.style.display = 'none';
        }
    });
}

function initializeAssociationGallery() {
    // Implementar galeria para páginas de associações
    const galleryItems = document.querySelectorAll('.galeria-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Implementar lightbox ou modal para a galeria
            openImageModal(this.querySelector('img').src);
        });
        
        // Suporte a teclado
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openImageModal(this.querySelector('img').src);
            }
        });
    });
}

function openImageModal(imageSrc) {
    // Implementar modal para visualização de imagens
    console.log('Abrir imagem:', imageSrc);
    // Aqui poderia ser implementado um lightbox
}

// Prevenir scroll horizontal
function preventHorizontalScroll() {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
}

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registado com sucesso: ', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha no registo do ServiceWorker: ', error);
            });
    });
}

// Web Vitals (opcional - para monitorização de performance)
function reportWebVitals() {
    if (typeof window.gtag === 'function') {
        // Integração com Google Analytics
        // Aqui poderia ser implementado o tracking de métricas de performance
    }
}

// Event listeners para carregamento
document.addEventListener('DOMContentLoaded', preventHorizontalScroll);
window.addEventListener('resize', preventHorizontalScroll);
window.addEventListener('load', preventHorizontalScroll);
window.addEventListener('load', reportWebVitals);

// Exportar funções para uso global (se necessário)
window.JuntaFreguesia = {
    showFormMessage,
    initializeSearch,
    filterDocuments
};

// Polyfills para browsers antigos (se necessário)
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

// script.js - Adicione estas funções

// Função para carregar dados do Google Sheets via CSV
async function carregarAssociacoes() {
    try {
        // URL do Google Sheets como CSV (substitua com o seu URL)
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/1RMzMCkSEuyMF7xkptmFBy3dkQD8dTQ6PLfxnJcC-pCU/gviz/tq?tqx=out:csv&sheet=Sheet1';
        
        const response = await fetch(sheetUrl);
        const csvData = await response.text();
        
        // Converter CSV para JSON
        const associacoes = csvParaJSON(csvData);
        
        // Renderizar as associações
        renderizarAssociacoes(associacoes);
        
        // Configurar event listeners para os modais
        configurarModais(associacoes);
        
    } catch (error) {
        console.error('Erro ao carregar associações:', error);
        // Fallback para dados estáticos em caso de erro
        carregarAssociacoesFallback();
    }
}

// Função para converter CSV para JSON
function csvParaJSON(csv) {
    const linhas = csv.split('\n');
    const headers = linhas[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    return linhas.slice(1).map(linha => {
        const valores = linha.split(',').map(valor => valor.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = valores[index] || '';
        });
        return obj;
    }).filter(assoc => assoc.Nome); // Filtrar linhas vazias
}

// Função para renderizar as associações na página
function renderizarAssociacoes(associacoes) {
    const container = document.getElementById('associacoes-container');
    
    if (!container) return;
    
    container.innerHTML = associacoes.map(associacao => `
        <div class="associacao-card" data-associacao="${associacao.Nome}">
            <div class="associacao-logo">
                <img src="${associacao.Logo}" alt="Logo ${associacao.Nome}" loading="lazy">
            </div>
            <h3>${associacao.Nome}</h3>
            <p>${associacao.Descricao}</p>
            <button class="btn-associacao">Saber Mais</button>
        </div>
    `).join('');
}

// Função para configurar os modais
function configurarModais(associacoes) {
    const modal = document.getElementById('associacao-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.modal-close');
    
    // Event listeners para abrir modal
    document.querySelectorAll('.associacao-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-associacao') || e.target.closest('.associacao-card')) {
                const nomeAssociacao = card.getAttribute('data-associacao');
                const associacao = associacoes.find(a => a.Nome === nomeAssociacao);
                
                if (associacao) {
                    abrirModal(associacao);
                }
            }
        });
    });
    
    // Fechar modal
    closeBtn.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
}

// Função para abrir o modal
function abrirModal(associacao) {
    const modal = document.getElementById('associacao-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-logo">
            <img src="${associacao.Logo}" alt="Logo ${associacao.Nome}">
        </div>
        <h2 class="modal-title">${associacao.Nome}</h2>
        <p class="modal-description">${associacao.Descricao}</p>
        
        ${associacao.Fundacao ? `<p class="modal-fundacao">Fundada em ${associacao.Fundacao}</p>` : ''}
        
        <div class="modal-contact-info">
            <h4>Contactos</h4>
            ${associacao.Email ? `<p><i class="fas fa-envelope"></i> ${associacao.Email}</p>` : ''}
            ${associacao.Telefone ? `<p><i class="fas fa-phone"></i> ${associacao.Telefone}</p>` : ''}
            ${associacao.Morada ? `<p><i class="fas fa-map-marker-alt"></i> ${associacao.Morada}</p>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Focar no botão de fechar para acessibilidade
    document.querySelector('.modal-close').focus();
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('associacao-modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

// Fallback em caso de erro no carregamento
function carregarAssociacoesFallback() {
    const associacoesFallback = [
        {
            Nome: "ADRC Parada de Gonta",
            Logo: "https://via.placeholder.com/100x100/2c5530/ffffff?text=ADRC",
            Descricao: "Associação Desportiva Recreativa e Cultural que promove o desporto, a cultura e o convívio comunitário.",
            Email: "adrc.paradadegonta@gmail.com",
            Telefone: "+351 232 700 100",
            Morada: "Rua da Associação, Parada de Gonta",
            Fundacao: "1986"
        },
        {
            Nome: "ASSODREC Parada de Gonta",
            Logo: "https://via.placeholder.com/100x100/4a7c59/ffffff?text=ASSODREC",
            Descricao: "Associação Social Desportiva Cultural e Recreativa focada em respostas sociais e apoio a idosos.",
            Email: "assodrec.paradadegonta@gmail.com",
            Telefone: "+351 232 700 300",
            Morada: "Rua da Associação, Parada de Gonta",
            Fundacao: "1997"
        }
    ];
    
    renderizarAssociacoes(associacoesFallback);
    configurarModais(associacoesFallback);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    carregarAssociacoes();
    
    // Resto do seu código existente...
});