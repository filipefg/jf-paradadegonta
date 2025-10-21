// js/utils/constants.js

export const CONFIG = {
    RESIZE_DELAY: 250,
    ANIMATION_DELAY: 300,
    SCROLL_THRESHOLD: 100,
    LAZY_LOAD_THRESHOLD: 0.1,
    ASSOCIATIONS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1RMzMCkSEuyMF7xkptmFBy3dkQD8dTQ6PLfxnJcC-pCU/gviz/tq?tqx=out:csv&sheet=Sheet1',
    SERVICES_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1RMzMCkSEuyMF7xkptmFBy3dkQD8dTQ6PLfxnJcC-pCU/gviz/tq?tqx=out:csv&sheet=Servicos',
    NEWS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1RMzMCkSEuyMF7xkptmFBy3dkQD8dTQ6PLfxnJcC-pCU/gviz/tq?tqx=out:csv&sheet=Noticias',
    DOCUMENTS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1RMzMCkSEuyMF7xkptmFBy3dkQD8dTQ6PLfxnJcC-pCU/gviz/tq?tqx=out:csv&sheet=Documentos'
};

export const SELECTORS = {
    NAV_TOGGLE: '.nav-toggle',
    NAV_MENU: '.nav-menu',
    HEADER: '.header',
    CONTACT_FORM: '#contactForm',
    BTN_LIMPAR: '#btnLimpar',
    ASSOCIACOES_CONTAINER: '#associacoes-container',
    SERVICOS_CONTAINER: '#servicos-container',
    NOTICIAS_CONTAINER: '#noticias-container',
    DOCUMENTOS_CONTAINER: '#documentos-container', // ← NOVO
    ASSOCIACAO_MODAL: '#associacao-modal',
    MODAL_BODY: '#modal-body'
};

export const CSS_CLASSES = {
    ACTIVE: 'active',
    SCROLLED: 'scrolled',
    ERROR: 'error',
    LAZY: 'lazy'
};