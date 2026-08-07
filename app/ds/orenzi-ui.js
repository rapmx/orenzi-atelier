/* Orenzi — utilitários de interface compartilhados entre painel.html,
 * painel_demo.html e agendar.html.
 *
 * Script clássico (window.orenziUI), não módulo — mesmo motivo do
 * shared/salon.js: as três páginas mantêm o resto do JS num único
 * <script> inline, e type="module" mudaria o escopo dele inteiro.
 * Carregado logo depois de shared/salon.js, antes do <script> inline.
 *
 * Hoje cobre só o ciclo saving → success → error de botão de escrita
 * (docs/09 UX Patterns não tinha um padrão nomeado pra isso; nasceu do PR
 * "UX Polish Sprint 1 — Saving/Success/Error States"). Os utilitários de
 * acessibilidade previstos em docs/08_IMPLEMENTATION_RULES.md §8
 * (captura de foco, aria-live) entram aqui quando os componentes que
 * dependem deles forem construídos — não duplicar este arquivo.
 */
window.orenziUI = (function () {
  'use strict';

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Janela de leitura do "✓ Salvo" antes de a tela seguir adiante — não é
  // uma transição de interface (por isso fora da escala de
  // docs/05_MOTION_SYSTEM.md §3), é tempo de leitura, como a permanência
  // do toast. Pedido do Raphael: "entre 500 e 800ms, sem exagero" — fixo
  // no meio da faixa.
  var SUCCESS_HOLD_MS = 650;

  /* Bloqueia o botão, troca o conteúdo por spinner + rótulo, sem deixar a
     largura mudar (docs pedem "não pode existir layout shift"). */
  function setButtonBusy(btn, label) {
    if (!btn || btn.dataset.orenziUiState === 'busy') return;
    if (btn.dataset.orenziUiState !== 'success') {
      btn.dataset.orenziUiOriginalHtml = btn.innerHTML;
    }
    if (!btn.dataset.orenziUiWidth) {
      btn.dataset.orenziUiWidth = btn.getBoundingClientRect().width + 'px';
    }
    btn.style.width = btn.dataset.orenziUiWidth;
    btn.dataset.orenziUiState = 'busy';
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML =
      '<span class="o-spinner" aria-hidden="true"></span><span>' + escapeHtml(label) + '</span>';
  }

  /* Troca o spinner por uma marca de confirmação e segura por
     SUCCESS_HOLD_MS antes de resolver — dá tempo de a pessoa perceber que
     terminou, sem virar celebração. Pulado com movimento reduzido: a
     pausa em si não é movimento, mas não faz sentido segurar a tela por
     uma transição que a preferência pede pra evitar em outros lugares. */
  function setButtonSuccess(btn, label) {
    if (!btn) return Promise.resolve();
    btn.dataset.orenziUiState = 'success';
    btn.removeAttribute('aria-busy');
    btn.innerHTML =
      '<span aria-hidden="true">✓</span><span>' + escapeHtml(label || 'Salvo') + '</span>';
    return new Promise(function (resolve) {
      window.setTimeout(resolve, prefersReducedMotion() ? 0 : SUCCESS_HOLD_MS);
    });
  }

  /* Devolve o botão ao estado normal — usar no caminho de erro, e depois
     de setButtonSuccess() se o botão for reaproveitado (ex.: modal que
     não fecha sozinho). Nunca deixar preso em "busy" ou "success". */
  function resetButton(btn) {
    if (!btn) return;
    if (btn.dataset.orenziUiOriginalHtml != null) {
      btn.innerHTML = btn.dataset.orenziUiOriginalHtml;
    }
    delete btn.dataset.orenziUiOriginalHtml;
    delete btn.dataset.orenziUiState;
    delete btn.dataset.orenziUiWidth;
    btn.style.width = '';
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── Focus trap genérico (docs/07_ACCESSIBILITY.md §8) ────────────────
     Primeiro utilitário desse tipo no projeto — nasce aqui pro
     ConfirmationDialog e fica pronto pra qualquer folha/modal futuro que
     precisar da mesma captura (BottomSheet ainda não migrado, por
     exemplo). Devolve uma função de liberação: quem chama guarda essa
     função e chama de volta ao fechar, senão o listener vaza. */
  var FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusableChildren(container) {
    return Array.prototype.slice
      .call(container.querySelectorAll(FOCUSABLE_SELECTOR))
      // offsetParent é null em elemento com display:none/oculto — não é o
      // teste de visibilidade mais rigoroso que existe, mas cobre o caso
      // real deste componente (nada escondido por posição fora da tela).
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function trapFocus(container) {
    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      var focusables = focusableChildren(container);
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', onKeydown);
    return function release() {
      container.removeEventListener('keydown', onKeydown);
    };
  }

  /* ── ConfirmationDialog (docs/04_COMPONENT_LIBRARY.md §ConfirmationDialog,
     docs/09_UX_PATTERNS.md §11/12) ──────────────────────────────────────
     Substitui window.confirm() nativo. Anatomia converge com BottomSheet
     (docs/05 §14: fundo + folha sobem juntos, sem bounce, sem scale) e usa
     Button destructive já existente em orenzi-components.css
     (.o-btn-destructive). Uma instância por vez — abrir uma nova fecha
     qualquer anterior ainda de pé, mesmo espírito de "um toast por vez". */
  var activeDialog = null;

  function closeConfirmDialog(overlay, dialog, releaseFocus, opener) {
    if (overlay.dataset.state === 'closing') return;
    overlay.dataset.state = 'closing';
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    releaseFocus();
    // Cobre também o fechamento forçado (uma nova confirmação substituindo
    // uma anterior ainda aberta) — ali ninguém passa pelo close() de
    // confirmDialog(), então o listener de Esc só sai daqui.
    if (overlay._onKeydown) document.removeEventListener('keydown', overlay._onKeydown);
    if (activeDialog === overlay) activeDialog = null;

    var cleaned = false;
    function remove() {
      if (cleaned) return;
      cleaned = true;
      overlay.removeEventListener('transitionend', onEnd);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      // Restaura o foco pra quem abriu — docs/07 §8.5. Se o elemento não
      // existir mais (lista recarregou por baixo), não há pra onde voltar.
      if (opener && document.contains(opener)) opener.focus();
    }
    function onEnd(e) {
      if (e.target === overlay) remove();
    }
    overlay.addEventListener('transitionend', onEnd);
    // Rede de segurança: mesma técnica de morphAvatar() no painel — nenhuma
    // animação pode depender só do evento de término pra se limpar
    // (docs/03_DESIGN_SYSTEM.md §20 regra 20; aba em segundo plano nunca
    // compõe frames e o transitionend correspondente nunca dispara).
    setTimeout(remove, 260);
  }

  function confirmDialog(opts) {
    opts = opts || {};
    var title = opts.title || '';
    var message = opts.message || '';
    var confirmLabel = opts.confirmLabel || 'Confirmar';
    var cancelLabel = opts.cancelLabel || 'Cancelar';
    var destructive = !!opts.destructive;
    var successLabel = opts.successLabel || 'Feito';
    var onConfirm = opts.onConfirm;

    if (activeDialog) closeConfirmDialog.apply(null, activeDialog._closeArgs);

    var opener = document.activeElement;
    var uid = 'oDialog' + Date.now() + Math.floor(Math.random() * 1000);

    var overlay = document.createElement('div');
    overlay.className = 'o-dialog-overlay';
    overlay.innerHTML =
      '<div class="o-dialog" role="alertdialog" aria-modal="true" ' +
      'aria-labelledby="' + uid + 'Title" aria-describedby="' + uid + 'Msg">' +
      '<p class="o-dialog-title" id="' + uid + 'Title">' + escapeHtml(title) + '</p>' +
      (message ? '<p class="o-dialog-message" id="' + uid + 'Msg">' + escapeHtml(message) + '</p>' : '') +
      '<div class="o-dialog-error" id="' + uid + 'Error" role="alert" hidden></div>' +
      '<div class="o-dialog-actions">' +
      '<button type="button" class="o-btn o-btn-secondary" data-role="cancel">' + escapeHtml(cancelLabel) + '</button>' +
      '<button type="button" class="o-btn ' + (destructive ? 'o-btn-destructive' : 'o-btn-primary') + '" data-role="confirm">' +
      escapeHtml(confirmLabel) + '</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var dialog = overlay.querySelector('.o-dialog');
    var cancelBtn = overlay.querySelector('[data-role="cancel"]');
    var confirmBtn = overlay.querySelector('[data-role="confirm"]');
    var errorEl = overlay.querySelector('.o-dialog-error');
    var release = trapFocus(dialog);

    var closeArgs = [overlay, dialog, release, opener];
    overlay._closeArgs = closeArgs;
    activeDialog = overlay;

    function close() {
      closeConfirmDialog.apply(null, closeArgs);
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
    }
    function hideError() {
      errorEl.hidden = true;
    }

    function busy() {
      return confirmBtn.dataset.orenziUiState === 'busy';
    }

    cancelBtn.onclick = function () {
      if (busy()) return;
      close();
    };

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && !busy()) close();
    });

    // Guardado no próprio overlay (não só na closure) porque
    // closeConfirmDialog() também precisa removê-lo no caminho de
    // fechamento forçado (uma confirmação nova substituindo esta) — ali
    // ninguém passa pelo close() daqui embaixo.
    overlay._onKeydown = function onKeydown(e) {
      if (e.key !== 'Escape' || busy()) return;
      close();
    };
    document.addEventListener('keydown', overlay._onKeydown);

    confirmBtn.onclick = function () {
      if (busy()) return;
      hideError();
      cancelBtn.disabled = true;
      setButtonBusy(confirmBtn, opts.confirmingLabel || (destructive ? 'Removendo…' : 'Confirmando…'));
      Promise.resolve()
        .then(function () { return onConfirm && onConfirm(); })
        .then(function () { return setButtonSuccess(confirmBtn, successLabel); })
        .then(function () { close(); })
        .catch(function (err) {
          resetButton(confirmBtn);
          cancelBtn.disabled = false;
          showError((err && err.message) || 'Não foi possível concluir. Tente de novo.');
        });
    };

    // Entrada: fundo + folha sobem juntos (docs/05 §14) — a classe some no
    // frame seguinte, depois de o navegador já ter pintado o estado inicial
    // (transform:translateY(100%)), senão não haveria transição pra animar.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('is-open');
      });
    });

    // Foco inicial em Cancelar, nunca no botão destrutivo (docs/04
    // §ConfirmationDialog, docs/07 §8.4).
    cancelBtn.focus();

    return { close: close };
  }

  return {
    setButtonBusy: setButtonBusy,
    setButtonSuccess: setButtonSuccess,
    resetButton: resetButton,
    prefersReducedMotion: prefersReducedMotion,
    SUCCESS_HOLD_MS: SUCCESS_HOLD_MS,
    trapFocus: trapFocus,
    confirm: confirmDialog,
  };
})();
