// script.js

// Menu mobile toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animação do ícone do menu
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
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
    
    // Scroll suave melhorado
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Só aplicar scroll suave para links âncora na mesma página
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Fechar menu mobile se estiver aberto
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        // Reset do ícone do menu
                        const spans = navToggle.querySelectorAll('span');
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                    
                    // Calcular a posição com offset menor
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.padding = '0.5rem 0';
            } else {
                header.style.padding = '1rem 0';
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
            }
        });
    }, observerOptions);
    
    // Aplicar animação aos elementos
    const animateElements = document.querySelectorAll('.servico-card, .noticia-card, .sobre-content > div, .contactos-content > div, .associacao-card, .documento-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    
    // Atualizar ano no footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        yearElement.innerHTML = yearElement.innerHTML.replace('2023', currentYear);
    }
});

// Formulário de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                assunto: formData.get('assunto'),
                mensagem: formData.get('mensagem')
            };
            
            // Validar dados
            if (!data.nome || !data.telefone || !data.assunto || !data.mensagem) {
                showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            // Mostrar estado de carregamento
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'A enviar...';
            submitBtn.disabled = true;
            
            try {
                // Simular envio (substituir por EmailJS ou outra solução)
                await simulateEmailSend(data);
                
                showMessage('Mensagem enviada com sucesso! Entraremos em contacto brevemente.', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                showMessage('Erro ao enviar mensagem. Por favor, tente novamente ou contacte-nos diretamente.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    function showMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            
            // Esconder mensagem após 5 segundos
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    // Função simulada para enviar email
    async function simulateEmailSend(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Email enviado:', data);
                resolve();
            }, 2000);
        });
    }
    
    // Alternativa: abrir cliente de email padrão
    function sendWithMailClient(data) {
        const subject = `Contacto Website: ${data.assunto}`;
        const body = `Nome: ${data.nome}%0D%0AEmail: ${data.email}%0D%0ATelefone: ${data.telefone || 'Não fornecido'}%0D%0A%0D%0AMensagem:%0D%0A${data.mensagem}`;
        
        window.location.href = `mailto:jf-paradadegonta@example.pt?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
});

// Paginação para notícias
document.addEventListener('DOMContentLoaded', function() {
    const noticiasPerPage = 6;
    let currentPage = 1;
    
    function setupPagination() {
        const noticiasGrid = document.querySelector('.noticias-grid');
        const paginacao = document.querySelector('.paginacao');
        
        if (!noticiasGrid || !paginacao) return;
        
        const allNoticias = Array.from(noticiasGrid.children);
        const totalPages = Math.ceil(allNoticias.length / noticiasPerPage);
        
        // Mostrar primeira página inicialmente
        showPage(1, allNoticias, noticiasGrid);
        
        // Criar botões de paginação
        updatePaginationButtons(totalPages, paginacao, allNoticias, noticiasGrid);
    }
    
    function showPage(page, noticias, container) {
        const start = (page - 1) * noticiasPerPage;
        const end = start + noticiasPerPage;
        
        noticias.forEach((noticia, index) => {
            noticia.style.display = 
                (index >= start && index < end) ? 'block' : 'none';
        });
        
        currentPage = page;
    }
    
    function updatePaginationButtons(totalPages, paginacao, noticias, container) {
        paginacao.innerHTML = '';
        
        // Botão anterior
        const prevBtn = document.createElement('a');
        prevBtn.href = '#';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.classList.add('prev');
        if (currentPage === 1) prevBtn.classList.add('disabled');
        
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                showPage(currentPage - 1, noticias, container);
                updatePaginationButtons(totalPages, paginacao, noticias, container);
            }
        });
        
        paginacao.appendChild(prevBtn);
        
        // Botões de página
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('a');
            pageBtn.href = '#';
            pageBtn.textContent = i;
            if (i === currentPage) pageBtn.classList.add('active');
            
            pageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(i, noticias, container);
                updatePaginationButtons(totalPages, paginacao, noticias, container);
            });
            
            paginacao.appendChild(pageBtn);
        }
        
        // Botão seguinte
        const nextBtn = document.createElement('a');
        nextBtn.href = '#';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.classList.add('next');
        if (currentPage === totalPages) nextBtn.classList.add('disabled');
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                showPage(currentPage + 1, noticias, container);
                updatePaginationButtons(totalPages, paginacao, noticias, container);
            }
        });
        
        paginacao.appendChild(nextBtn);
    }
    
    // Inicializar paginação se existir
    setupPagination();
});