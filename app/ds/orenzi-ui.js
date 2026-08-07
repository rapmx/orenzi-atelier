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

  return {
    setButtonBusy: setButtonBusy,
    setButtonSuccess: setButtonSuccess,
    resetButton: resetButton,
    prefersReducedMotion: prefersReducedMotion,
    SUCCESS_HOLD_MS: SUCCESS_HOLD_MS,
  };
})();
