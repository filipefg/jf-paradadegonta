// Menu mobile toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.querySelector('body');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                // Fechar menu
                navMenu.classList.remove('active');
                body.style.overflow = 'auto';
            } else {
                // Abrir menu
                navMenu.classList.add('active');
                body.style.overflow = 'hidden';
            }
            
            // Animação do ícone do menu
            const spans = this.querySelectorAll('span');
            if (!isActive) {
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
        link.addEventListener('click', function() {
            // Fechar menu mobile
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                body.style.overflow = 'auto';
                
                // Reset do ícone do menu
                if (navToggle) {
                    const spans = navToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
            
            // Scroll suave apenas para âncoras na mesma página
            if (this.getAttribute('href').startsWith('#') && !this.getAttribute('href').includes('.html')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
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
    
    // Fechar menu ao redimensionar a janela
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            body.style.overflow = 'auto';
            
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
    
    // Botão de limpar formulário
    const btnLimpar = document.getElementById('btnLimpar');
    const contactForm = document.getElementById('contactForm');
    
    if (btnLimpar && contactForm) {
        btnLimpar.addEventListener('click', function() {
            if (confirm('Tem a certeza que pretende limpar o formulário?')) {
                contactForm.reset();
            }
        });
    }
    
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

// Prevenir scroll horizontal
function preventHorizontalScroll() {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
}

document.addEventListener('DOMContentLoaded', preventHorizontalScroll);
window.addEventListener('resize', preventHorizontalScroll);
window.addEventListener('load', preventHorizontalScroll);