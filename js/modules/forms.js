// js/modules/forms.js

import { SELECTORS, CSS_CLASSES } from '../utils/constants.js';
import { showNotification, isValidEmail } from '../utils/helpers.js';

export function initializeForms() {
    const contactForm = document.querySelector(SELECTORS.CONTACT_FORM);
    const btnLimpar = document.querySelector(SELECTORS.BTN_LIMPAR);

    if (contactForm) {
        setupContactForm(contactForm);
    }

    if (btnLimpar && contactForm) {
        setupClearButton(btnLimpar, contactForm);
    }
}

function setupContactForm(form) {
    form.addEventListener('submit', handleFormSubmit);
    
    // Validação em tempo real
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const isValid = validateForm(form);
    
    if (isValid) {
        submitForm(form);
    }
}

function validateForm(form) {
    const nome = form.querySelector('#nome');
    const email = form.querySelector('#email');
    const telefone = form.querySelector('#telefone');
    const mensagem = form.querySelector('#mensagem');
    
    let isValid = true;
    
    clearFormErrors(form);
    
    // Validar nome
    if (!nome.value.trim()) {
        showFieldError(nome, 'Por favor, insira o seu nome.');
        isValid = false;
    }
    
    // Validar email se existir
    if (email && email.value.trim() && !isValidEmail(email.value)) {
        showFieldError(email, 'Por favor, insira um email válido.');
        isValid = false;
    }
    
    // Validar mensagem
    if (!mensagem.value.trim()) {
        showFieldError(mensagem, 'Por favor, insira a sua mensagem.');
        isValid = false;
    }
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    
    if (field.id === 'email' && field.value.trim() && !isValidEmail(field.value)) {
        showFieldError(field, 'Por favor, insira um email válido.');
        return;
    }
    
    if (field.required && !field.value.trim()) {
        showFieldError(field, 'Este campo é obrigatório.');
    }
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove(CSS_CLASSES.ERROR);
    field.style.borderColor = '';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add(CSS_CLASSES.ERROR);
    
    // Remover mensagens anteriores
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    Object.assign(errorDiv.style, {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem'
    });
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

function clearFormErrors(form) {
    form.querySelectorAll(`.${CSS_CLASSES.ERROR}`).forEach(el => {
        el.classList.remove(CSS_CLASSES.ERROR);
        el.style.borderColor = '';
    });
    
    form.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
}

function submitForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Estado de carregamento
    submitBtn.textContent = 'A enviar...';
    submitBtn.disabled = true;
    
    // Simular envio (substituir pela lógica real)
    setTimeout(() => {
        showNotification('Mensagem enviada com sucesso! Entraremos em contacto brevemente.', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // form.submit(); // Descomentar para envio real
    }, 2000);
}

function setupClearButton(button, form) {
    button.addEventListener('click', () => {
        if (confirm('Tem a certeza que pretende limpar o formulário? Todos os dados inseridos serão perdidos.')) {
            form.reset();
            clearFormErrors(form);
            showNotification('Formulário limpo com sucesso.', 'success');
        }
    });
}