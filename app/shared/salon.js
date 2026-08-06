/* Orenzi — expediente do salão, uma só cópia.
 *
 * Carregado antes do <script> inline em painel.html, painel_demo.html e
 * agendar.html. Script clássico (window.OrenziSalon), não módulo ES: as três
 * páginas guardam o resto do JS num único <script> inline, e type="module"
 * mudaria o escopo dele inteiro.
 *
 * Mudou expediente? Mexe só aqui — antes disso o valor vivia em cópia em cada
 * arquivo, e se um lado mudasse sem o outro, cliente e painel passavam a
 * oferecer horários diferentes para o mesmo dia (overbooking silencioso).
 */
window.OrenziSalon = (function () {
  'use strict';

  const SALON_TZ = 'Europe/Dublin';   // fuso do SALÃO, não o do aparelho de quem abre
  const OPEN_HOUR = 9;
  const CLOSE_HOUR = 18;              // o atendimento tem que TERMINAR até aqui
  const SLOT_MINUTES = 30;
  const CLOSED_WEEKDAYS = [0, 1];     // 0 = domingo, 1 = segunda — fecha os dois

  return { SALON_TZ, OPEN_HOUR, CLOSE_HOUR, SLOT_MINUTES, CLOSED_WEEKDAYS };
})();
