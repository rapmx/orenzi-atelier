/* Orenzi — regras do salão, uma só cópia.
 *
 * Este arquivo existia duas vezes: metade em agendar.html, metade em painel.html.
 * As cópias divergiram (o relógio virou 12h só no painel) e a divergência que
 * importa não é cosmética: se o expediente ou a regra de conflito mudar num
 * arquivo e não no outro, a cliente e o painel passam a oferecer horários
 * diferentes para o mesmo dia, e isso aparece como overbooking.
 *
 * Script clássico de propósito, não módulo ES: as duas páginas guardam todo o JS
 * num <script> inline, e trocar para type="module" mudaria o escopo do arquivo
 * inteiro. Aqui basta carregar antes do inline e desestruturar window.OrenziSalon.
 */
window.OrenziSalon = (function () {
  'use strict';

  // ── Expediente ─────────────────────────────────────────────
  const SALON_TZ = 'Europe/Dublin';   // fuso do SALÃO, não o do aparelho de quem abre
  const OPEN_HOUR = 9;
  const CLOSE_HOUR = 18;              // o atendimento tem que TERMINAR até aqui
  const SLOT_MINUTES = 30;
  const CLOSED_WEEKDAYS = [0, 1];     // domingo e segunda. Sábado abre normal.
  const CADEIRAS_PADRAO = 4;

  // ── Relógio do salão ───────────────────────────────────────
  // Quantos minutos o fuso do salão está à frente do UTC naquele instante
  // (cobre o horário de verão irlandês automaticamente).
  function salonOffsetMinutes(date) {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: SALON_TZ, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const p = {};
    for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
    const asUTC = Date.UTC(+p.year, p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
    return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
  }

  // "2026-07-27" + 570min -> o instante absoluto das 09:30 em Dublin.
  function salonTimeToInstant(dateStr, minutesFromMidnight) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const naive = Date.UTC(y, m - 1, d, 0, 0, 0) + minutesFromMidnight * 60000;
    const off1 = salonOffsetMinutes(new Date(naive));
    let inst = new Date(naive - off1 * 60000);
    const off2 = salonOffsetMinutes(inst);          // 2ª passada: virada do horário de verão
    if (off2 !== off1) inst = new Date(naive - off2 * 60000);
    return inst;
  }

  // Data de hoje NO SALÃO, em YYYY-MM-DD.
  function salonToday() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: SALON_TZ }).format(new Date());
  }

  // Dois formatos porque as duas telas escolheram diferente, e isso é decisão de
  // interface, não de regra: a cliente vê "16:00", o painel vê "4:00 pm".
  function salonClock24(date) {
    return date.toLocaleTimeString('pt-BR', { timeZone: SALON_TZ, hour: '2-digit', minute: '2-digit' });
  }
  function salonClock12(date) {
    return date.toLocaleTimeString('en-US', { timeZone: SALON_TZ, hour: 'numeric', minute: '2-digit' })
      .replace(/\s*(AM|PM)$/, (_, p) => ' ' + p.toLowerCase());
  }

  // ── Segmentos do atendimento ───────────────────────────────
  // Trabalho inicial → pausa (profissional livre, cliente na cadeira de espera)
  // → trabalho final. Sem configuração, é tudo trabalho inicial: o comportamento
  // antigo, de antes da pausa existir.
  function segmentsOf(fonte, totalFallback) {
    const wb = fonte.work_before_minutes != null
      ? fonte.work_before_minutes
      : (totalFallback != null ? totalFallback : fonte.duration_minutes);
    return {
      wb: wb || 0,
      gp: fonte.gap_minutes || 0,
      wa: fonte.work_after_minutes || 0,
    };
  }

  // Só os blocos de TRABALHO ocupam a profissional e a cadeira. A pausa não —
  // é exatamente ela que abre espaço pro encaixe.
  function workBlocks(startMs, seg) {
    const blocos = [{ s: startMs, e: startMs + seg.wb * 60000 }];
    if (seg.wa > 0) {
      const off = (seg.wb + seg.gp) * 60000;
      blocos.push({ s: startMs + off, e: startMs + off + seg.wa * 60000 });
    }
    return blocos;
  }

  function totalMinutes(seg) {
    return seg.wb + seg.gp + seg.wa;
  }

  // ── Conflito ───────────────────────────────────────────────
  // A lotação das cadeiras só sobe no início de um bloco, então basta conferir
  // nesses pontos em vez de varrer minuto a minuto.
  function semCadeiraLivre(inicio, fim, ocupacoes, cadeiras) {
    const pontos = [inicio].concat(ocupacoes.map(o => o.s).filter(t => t > inicio && t < fim));
    return pontos.some(t =>
      ocupacoes.filter(o => o.s <= t && t < o.e).length + 1 > cadeiras
    );
  }

  // O veredito de um horário. Conflito de agenda existe quando UM bloco de
  // trabalho novo encosta num bloco de trabalho já marcado — pausa sobre pausa,
  // ou trabalho dentro da pausa alheia, é permitido.
  function slotStatus(startMs, seg, ocupacao) {
    const blocos = workBlocks(startMs, seg);
    const cadeiras = ocupacao.cadeiras || CADEIRAS_PADRAO;

    const conflitaAgenda = blocos.some(b =>
      (ocupacao.ocupada || []).some(o => b.s < o.e && b.e > o.s)
    );
    const semCadeira = blocos.some(b =>
      semCadeiraLivre(b.s, b.e, ocupacao.cadeirasEmUso || [], cadeiras)
    );

    return {
      livre: !conflitaAgenda && !semCadeira,
      motivo: conflitaAgenda ? 'agenda' : (semCadeira ? 'cadeira' : null),
    };
  }

  // ── Leitura da ocupação ────────────────────────────────────
  // Via RPC, não SELECT direto: a RLS de appointments só permite leitura
  // autenticada, então com a chave anônima a tabela voltava vazia e TODO horário
  // parecia livre. As duas RPCs são SECURITY DEFINER e já devolvem os blocos com
  // a pausa recortada fora.
  async function fetchOccupancy(sb, staffId, dateStr, cadeiras) {
    const dayStart = salonTimeToInstant(dateStr, 0).toISOString();
    const dayEnd = salonTimeToInstant(dateStr, 24 * 60 - 1).toISOString();

    const [prof, cadeirasRes] = await Promise.all([
      sb.rpc('get_busy_slots', { p_staff_id: staffId, p_from: dayStart, p_to: dayEnd }),
      sb.rpc('get_chair_load', { p_from: dayStart, p_to: dayEnd }),
    ]);

    const error = prof.error || cadeirasRes.error;
    if (error) return { error };

    return {
      ocupada: (prof.data || []).map(a => ({
        s: new Date(a.busy_start).getTime(), e: new Date(a.busy_end).getTime(),
      })),
      cadeirasEmUso: (cadeirasRes.data || []).map(o => ({
        s: new Date(o.occupied_start).getTime(), e: new Date(o.occupied_end).getTime(),
      })),
      cadeiras: cadeiras || CADEIRAS_PADRAO,
      error: null,
    };
  }

  async function fetchChairs(sb) {
    const { data } = await sb.from('salon_settings').select('chairs').limit(1).maybeSingle();
    return (data && data.chairs) || CADEIRAS_PADRAO;
  }

  return {
    SALON_TZ, OPEN_HOUR, CLOSE_HOUR, SLOT_MINUTES, CLOSED_WEEKDAYS, CADEIRAS_PADRAO,
    salonOffsetMinutes, salonTimeToInstant, salonToday, salonClock24, salonClock12,
    segmentsOf, workBlocks, totalMinutes,
    semCadeiraLivre, slotStatus,
    fetchOccupancy, fetchChairs,
  };
})();
