// js/modules/navigation.js
import { SELECTORS, CSS_CLASSES, CONFIG } from '../utils/constants.js';
import { debounce } from '../utils/helpers.js';

export function initializeNavigation() {
    const navToggle = document.querySelector(SELECTORS.NAV_TOGGLE);
    const navMenu = document.querySelector(SELECTORS.NAV_MENU);
    const header = document.querySelector(SELECTORS.HEADER);
    
    if (!navToggle || !navMenu) return;

    let isMenuOpen = false;

    // Menu mobile toggle
    navToggle.addEventListener('click', toggleMobileMenu);

    // Fechar menu ao clicar em links
    setupMenuLinks(navMenu);

    // Header scroll effect
    if (header) {
        setupHeaderScroll(header);
    }

    // Fechar menu ao redimensionar
    window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DELAY));

    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        navMenu.classList.toggle(CSS_CLASSES.ACTIVE);
        navToggle.setAttribute('aria-expanded', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        animateMenuIcon(navToggle, isMenuOpen);
    }

    function animateMenuIcon(toggleElement, open) {
        const spans = toggleElement.querySelectorAll('span');
        if (!spans.length === 3) return;

        if (open) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }

    function setupMenuLinks(menuElement) {
        const navLinks = menuElement.querySelectorAll('a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', handleMenuLinkClick);
        });
    }

    function handleMenuLinkClick(e) {
        // Fechar menu mobile se estiver aberto
        if (navMenu.classList.contains(CSS_CLASSES.ACTIVE)) {
            closeMobileMenu();
        }

        // Scroll suave para âncoras
        if (this.getAttribute('href').startsWith('#') && 
            !this.getAttribute('href').includes('.html')) {
            e.preventDefault();
            smoothScrollToAnchor(this.getAttribute('href'));
        }
    }

    function closeMobileMenu() {
        navMenu.classList.remove(CSS_CLASSES.ACTIVE);
        document.body.style.overflow = '';
        isMenuOpen = false;
        
        animateMenuIcon(navToggle, false);
        navToggle.setAttribute('aria-expanded', 'false');
    }

    function smoothScrollToAnchor(anchorId) {
        const targetSection = document.querySelector(anchorId);
        if (!targetSection) return;

        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        history.pushState(null, null, anchorId);
    }

    function setupHeaderScroll(headerElement) {
        let lastScrollY = window.scrollY;
        
        const handleScroll = debounce(() => {
            const currentScrollY = window.scrollY;
            
            // Efeito de reduzir padding
            if (currentScrollY > CONFIG.SCROLL_THRESHOLD) {
                headerElement.classList.add(CSS_CLASSES.SCROLLED);
            } else {
                headerElement.classList.remove(CSS_CLASSES.SCROLLED);
            }
            
            // Hide/show no scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                headerElement.style.transform = 'translateY(-100%)';
            } else {
                headerElement.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 10);
        
        window.addEventListener('scroll', handleScroll);
    }

    function handleResize() {
        if (window.innerWidth > 768 && navMenu.classList.contains(CSS_CLASSES.ACTIVE)) {
            closeMobileMenu();
        }
    }
}