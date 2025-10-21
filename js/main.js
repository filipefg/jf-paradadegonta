// script.js - Versão Otimizada e Corrigida

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
            body.style.overflow = isMenuOpen ? 'hidden' : '';
            
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
                body.style.overflow = '';
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
                body.style.overflow = '';
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
                    showFormMessage('Mensagem enviada com sucesso! Entraremos em contacto brevemente.', 'success');
                    contactForm.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Envio real do formulário (descomentar quando pronto)
                    contactForm.submit();
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
        '.card, .noticia-card, .sobre-content > div, .contactos-content > div'
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
    
    // Inicializar funcionalidades específicas
    initializeMenuAccessibility();
    initializeModalMobile();
    carregarAssociacoes();
});

// Funções para carregar associações
async function carregarAssociacoes() {
    try {
        // URL do Google Sheets como CSV
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

function renderizarAssociacoes(associacoes) {
    const container = document.getElementById('associacoes-container');
    
    if (!container) return;
    
    container.innerHTML = associacoes.map(associacao => `
        <div class="associacao-card card" data-associacao="${associacao.Nome}">
            <div class="associacao-logo card-image">
                <img src="${associacao.Logo}" alt="Logo ${associacao.Nome}" loading="lazy">
            </div>
            <h3>${associacao.Nome}</h3>
            <p>${associacao.Descricao}</p>
            <button class="btn-associacao btn btn-small">Mais</button>
        </div>
    `).join('');
}

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
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
}

function abrirModal(associacao) {
    const modal = document.getElementById('associacao-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-logo">
                <img src="${associacao.Logo}" alt="Logo ${associacao.Nome}" loading="lazy">
            </div>
            <h2 class="modal-title">${associacao.Nome}</h2>
        </div>
        <div class="modal-content-inner">
            <p class="modal-description">${associacao.Descricao}</p>
            
            ${associacao.Fundacao ? `
                <p class="modal-fundacao">
                    <i class="fas fa-calendar-alt"></i> Fundada em ${associacao.Fundacao}
                </p>
            ` : ''}
            
            <div class="modal-contact-info">
                <h4><i class="fas fa-address-card"></i> Informações de Contacto</h4>
                ${associacao.Email ? `
                    <p>
                        <i class="fas fa-envelope"></i> 
                        <a href="mailto:${associacao.Email}" style="color: inherit; text-decoration: none;">
                            ${associacao.Email}
                        </a>
                    </p>
                ` : ''}
                ${associacao.Telefone ? `
                    <p>
                        <i class="fas fa-phone"></i> 
                        <a href="tel:${associacao.Telefone.replace(/\s/g, '')}" style="color: inherit; text-decoration: none;">
                            ${associacao.Telefone}
                        </a>
                    </p>
                ` : ''}
                ${associacao.Morada ? `
                    <p>
                        <i class="fas fa-map-marker-alt"></i> 
                        <span>${associacao.Morada}</span>
                    </p>
                ` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    
    // Adicionar classe para animação
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Focar no botão de fechar para acessibilidade
    setTimeout(() => {
        document.querySelector('.modal-close').focus();
    }, 100);
}

function fecharModal() {
    const modal = document.getElementById('associacao-modal');
    
    // Animação de saída
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        modal.setAttribute('aria-hidden', 'true');
    }, 300);
}

function carregarAssociacoesFallback() {
    const associacoesFallback = [
        {
            Nome: "ADRC Parada de Gonta",
            Logo: "https://via.placeholder.com/150x150/2c5530/ffffff?text=ADRC",
            Descricao: "Associação Desportiva Recreativa e Cultural que promove o desporto, a cultura e o convívio comunitário.",
            Email: "adrc.paradadegonta@gmail.com",
            Telefone: "+351 232 700 100",
            Morada: "Rua da Associação, Parada de Gonta",
            Fundacao: "1986"
        },
        {
            Nome: "ASSODREC Parada de Gonta",
            Logo: "https://via.placeholder.com/150x150/4a7c59/ffffff?text=ASSODREC",
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
    
    // Estilos para a mensagem
    messageDiv.style.padding = '1rem';
    messageDiv.style.margin = '1rem 0';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.fontWeight = '600';
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
    
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
    
    // Estilos para mensagem de erro
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    
    // Estilo para campo com erro
    field.style.borderColor = '#dc3545';
}

function clearFormErrors() {
    // Remover classes de erro
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
        el.style.borderColor = '';
    });
    
    // Remover mensagens de erro
    document.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
}

function initializeMenuAccessibility() {
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

function initializeModalMobile() {
    const modal = document.getElementById('associacao-modal');
    
    // Fechar modal ao tocar no overlay (apenas em mobile)
    modal.addEventListener('click', (e) => {
        if (e.target === modal && window.innerWidth <= 768) {
            fecharModal();
        }
    });
    
    // Swipe para fechar (para mobile)
    if ('ontouchstart' in window) {
        const modalContent = document.querySelector('.modal-content');
        let startY = 0;
        
        modalContent.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        modalContent.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Swipe para baixo para fechar
            if (diff > 50 && window.innerWidth <= 768) {
                fecharModal();
            }
        });
    }
}

// Prevenir scroll horizontal
function preventHorizontalScroll() {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
}

// Event listeners para carregamento
document.addEventListener('DOMContentLoaded', preventHorizontalScroll);
window.addEventListener('resize', preventHorizontalScroll);
window.addEventListener('load', preventHorizontalScroll);

// Exportar funções para uso global (se necessário)
window.JuntaFreguesia = {
    showFormMessage,
    carregarAssociacoes,
    fecharModal
};