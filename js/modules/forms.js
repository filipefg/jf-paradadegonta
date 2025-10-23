// js/modules/forms.js

// forms.js - FICHEIRO COMPLETO ATUALIZADO
import { SELECTORS } from '../utils/constants.js';
import { showNotification, isValidEmail } from '../utils/helpers.js';

// ===== FORMULÁRIO DE CONTACTO (NOVO SISTEMA) =====
export function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    const btnLimpar = document.getElementById('btnLimpar');

    if (contactForm) {
        setupContactForm(contactForm);
    }

    if (btnLimpar && contactForm) {
        setupClearButton(btnLimpar, contactForm);
    }
}

function setupContactForm(form) {
    form.addEventListener('submit', handleContactFormSubmit);
    
    // Validação em tempo real
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const isValid = validateContactForm(form);
    
    if (isValid) {
        await submitContactForm(form);
    }
}

function validateContactForm(form) {
    const nome = form.querySelector('#nome');
    const email = form.querySelector('#email');
    const assunto = form.querySelector('#assunto');
    const mensagem = form.querySelector('#mensagem');
    
    let isValid = true;
    
    clearFormErrors(form);
    
    // Validar nome
    if (!nome.value.trim()) {
        showFieldError(nome, 'Por favor, insira o seu nome.');
        isValid = false;
    }
    
    // Validar email
    if (!email.value.trim()) {
        showFieldError(email, 'Por favor, insira o seu email.');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, 'Por favor, insira um email válido.');
        isValid = false;
    }
    
    // Validar assunto
    if (!assunto.value) {
        showFieldError(assunto, 'Por favor, selecione um assunto.');
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
    field.classList.remove('error');
    field.style.borderColor = '';
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
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
        marginTop: '0.25rem',
        fontWeight: '500'
    });
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc3545';
}

function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
        el.style.borderColor = '';
    });
    
    form.querySelectorAll('.error-message').forEach(el => {
        el.remove();
    });
}

async function submitContactForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Estado de carregamento
    submitBtn.textContent = 'A enviar...';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    const dadosContacto = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone') || 'Não fornecido',
        assunto: formData.get('assunto'),
        mensagem: formData.get('mensagem'),
        data_contacto: new Date().toLocaleString('pt-PT')
    };

    try {
        await enviarEmailContacto(dadosContacto);
        
        // Sucesso
        form.reset();
        showNotification('Mensagem enviada com sucesso! Entraremos em contacto brevemente.', 'success');
        
    } catch (error) {
        console.error('Erro no envio do contacto:', error);
        showNotification('Erro ao enviar mensagem. Tente novamente ou contacte-nos diretamente.', 'error');
    } finally {
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// FUNÇÃO DE ENVIO - Igual aos alugueres
async function enviarEmailContacto(dadosContacto) {
    // MUDAR O EMAIL PARA O DA JUNTA:
    const response = await fetch('https://formsubmit.co/ajax/filipefg@gmail.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            _subject: `📧 Novo Contacto - ${dadosContacto.assunto}`,
            _template: 'table',
            _cc: dadosContacto.email,
            nome: dadosContacto.nome,
            email: dadosContacto.email,
            telefone: dadosContacto.telefone,
            assunto: dadosContacto.assunto,
            mensagem: dadosContacto.mensagem,
            data_contacto: dadosContacto.data_contacto
        })
    });

    if (!response.ok) {
        throw new Error('Erro no envio do email');
    }

    return await response.json();
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

// ===== FUNÇÃO ORIGINAL initializeForms (se ainda precisar) =====
export function initializeForms() {
    // Esta função pode estar vazia agora, ou manter código antigo se necessário
    console.log('Forms module initialized');
}

// CSS para erros
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #dc3545 !important;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 500;
    }
    
    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Exportar para uso global
window.initializeContactForm = initializeContactForm;