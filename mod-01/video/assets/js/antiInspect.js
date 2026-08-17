/* lock.js — bloqueio de comandos + clique direito (dissuasão) */
(() => {
    // true = bloqueia TODOS os cliques (esquerdo também) fora de elementos permitidos
    const BLOCK_ALL_CLICKS = false;

    // elementos onde o clique/seleção continuam funcionando mesmo com BLOCK_ALL_CLICKS
    const ALLOW_SELECTORS = 'input, textarea, select, button, a, [contenteditable], [data-allow]';

    // utilitário para cancelar completamente
    function stop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        return false;
    }

    // 1) menu de contexto (botão direito)
    addEventListener('contextmenu', stop, { capture: true });

    // 2) mouse: bloqueia botão direito/middle; opcionalmente bloqueia esquerdo
    addEventListener('mousedown', e => {
        if (e.button === 2 || e.button === 1) return stop(e); // direito/middle
        if (BLOCK_ALL_CLICKS && !e.target.closest(ALLOW_SELECTORS)) return stop(e); // esquerdo
    }, { capture: true });

    addEventListener('click', e => {
        if (BLOCK_ALL_CLICKS && !e.target.closest(ALLOW_SELECTORS)) return stop(e);
    }, { capture: true });

    // 3) atalhos comuns de DevTools / fonte / salvar / imprimir
    addEventListener('keydown', e => {
        const k = (e.key || '').toLowerCase();
        const isMac = /mac/i.test(navigator.platform);
        const cmd = isMac ? e.metaKey : e.ctrlKey;

        const blocked =
            e.keyCode === 123 ||                              // F12
            (cmd && e.shiftKey && ['i', 'j', 'c', 'k', 'm'].includes(k)) ||
            (cmd && ['u', 's', 'p'].includes(k)) ||            // View Source, Save, Print
            (isMac && e.metaKey && e.altKey && k === 'i');   // Cmd+Alt+I (mac)
        if (blocked) stop(e);
    }, { capture: true });

    // 4) cópia/seleção/colagem/arrasto — exceto em campos de entrada
    ['copy', 'cut', 'paste', 'dragstart', 'selectstart'].forEach(ev => {
        addEventListener(ev, e => {
            if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
            stop(e);
        }, { capture: true });
    });

    // 5) CSS para desabilitar seleção globalmente (mas permitir em inputs)
    const style = document.createElement('style');
    style.textContent = `
    html, body { -webkit-user-select: none; user-select: none; }
    input, textarea, [contenteditable="true"] { -webkit-user-select: text; user-select: text; }
  `;
    document.head.appendChild(style);
})();
