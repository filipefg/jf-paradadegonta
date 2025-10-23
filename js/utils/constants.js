// js/modules/constants.js

utils
export const CONFIG = {
    RESIZE_DELAY: 250,
    ANIMATION_DELAY: 300,
    SCROLL_THRESHOLD: 100,
    LAZY_LOAD_THRESHOLD: 0.1,
    ASSOCIATIONS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=associacoes',
    SERVICES_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=servicos',
    NEWS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=noticias',
    DOCUMENTS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=documentos',
    CALENDAR_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=eventos',
    RENTALS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1UvlC87XNVLB80gLTLk3zVgLss5Ru_YhwGyFAL50X5C0/gviz/tq?tqx=out:csv&sheet=',
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
    DOCUMENTOS_CONTAINER: '#documentos-container',
    ALUGUERES_CONTAINER: '#alugueres-container',
    
    // MODALS
    ASSOCIACAO_MODAL: '#associacao-modal',
    MODAL_BODY: '#modal-body',
    MODAL_CLOSE: '.modal-close',
    RESERVA_MODAL: '#reserva-modal',
    RESERVA_MODAL_BODY: '#reserva-modal-body',
    
    CALENDAR_SECTION: '#calendario',
    CALENDAR_GRID: '#calendario-grid',
    CALENDAR_MODAL: '#calendario-modal',
    CALENDAR_MODAL_BODY: '#calendario-modal-body',
    UPCOMING_EVENTS: '#upcoming-events'
};

export const CSS_CLASSES = {
    ACTIVE: 'active',
    SCROLLED: 'scrolled',
    ERROR: 'error',
    LAZY: 'lazy'
};