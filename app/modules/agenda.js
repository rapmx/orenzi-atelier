/* Orenzi — aba Agenda do painel: timeline do dia, tira da semana, calendário
 * do mês e o slide entre dias.
 *
 * Terceiro pedaço tirado de painel.html, e o que a gente mais mexe. De fora só
 * se chama renderAgenda() (pelo render()) e irParaDia() (pelo botão Hoje).
 *
 * Script clássico carregado antes do <script> inline. Depende do painel na hora
 * da chamada: state, app, render, colorForService, fmtTime, loadApptPhotos.
 * As constantes daqui (AGENDA_START_HOUR, AGENDA_END_HOUR) também são lidas pelo
 * occupancyPct() da tela inicial — script clássico compartilha o escopo global,
 * então isso continua funcionando.
 */

const AGENDA_START_HOUR = 8;
const AGENDA_END_HOUR = 19;
const HOUR_HEIGHT = 64;
const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function sameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// Segmentos do atendimento: trabalho inicial / pausa / trabalho final.
// O agendamento pode sobrescrever o padrão do serviço (cabelo que demorou mais).
function segmentsOf(a) {
  const s = a.service || {};
  const total = Math.round((new Date(a.ends_at) - new Date(a.starts_at)) / 60000);
  const wb = a.work_before_minutes ?? s.work_before_minutes ?? total;
  const gp = a.gap_minutes ?? s.gap_minutes ?? 0;
  const wa = a.work_after_minutes ?? s.work_after_minutes ?? 0;
  return { wb, gp, wa };
}

// Sobreposição empilhada, como no calendário do iPhone: o atendimento mais
// longo fica de fundo ocupando a faixa inteira e o encaixe entra por cima,
// recuado à esquerda. Dividir em colunas espremia os dois e escondia a pausa.
const NIVEL_RECUO = 18;   // px que cada camada entra pra dentro
const NIVEL_MAX = 3;      // além disso o bloco ficaria fino demais pra ler

function layoutAppts(appts) {
  const itens = appts
    .map(a => ({ a, s: new Date(a.starts_at).getTime(), e: new Date(a.ends_at).getTime() }))
    // Quem começa antes vai pro fundo; empatou, o mais longo é o fundo.
    .sort((x, y) => x.s - y.s || y.e - x.e);

  itens.forEach((it, i) => {
    // Quantos atendimentos já desenhados ainda estavam abertos quando este
    // começou — é o que faz o encaixe subir por cima da pausa.
    const nivel = itens.slice(0, i).filter(o => o.s <= it.s && o.e > it.s).length;
    it.nivel = Math.min(nivel, NIVEL_MAX);
  });
  return itens;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // volta até segunda: o salão fecha domingo
  d.setHours(0, 0, 0, 0);
  return d;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Troca de dia com slide: o dia que sai vira um clone por cima e desliza pro
// lado, o novo entra do lado oposto. Dia à frente entra pela direita; dia
// anterior, pela esquerda.
function irParaDia(novaData) {
  const anterior = state.agendaDate;
  const paraFrente = novaData.getTime() >= anterior.getTime();
  const viewport = document.querySelector('.timeline-viewport');
  const atual = viewport && viewport.querySelector('.timeline');

  // Mesmo dia (o "Hoje" já estando em hoje, ou reclicar o dia selecionado):
  // não faz sentido deslizar pro mesmo conteúdo.
  if (sameDay(novaData, anterior) || !atual || prefersReducedMotion()) {
    state.agendaDate = novaData;
    render();
    return;
  }

  const clone = atual.cloneNode(true);
  state.agendaDate = novaData;
  render();

  const novoViewport = document.querySelector('.timeline-viewport');
  const novo = novoViewport.querySelector('.timeline');
  clone.classList.add('slide-pane');
  novoViewport.appendChild(clone);

  const entrandoDe = paraFrente ? '100%' : '-100%';
  const saindoPara = paraFrente ? '-100%' : '100%';

  novo.style.transition = 'none';
  novo.style.transform = `translateX(${entrandoDe})`;
  clone.style.transform = 'translateX(0)';
  void novo.offsetWidth;   // força o navegador a assumir a posição inicial

  requestAnimationFrame(() => {
    novo.style.transition = 'transform .28s cubic-bezier(.22,.61,.36,1)';
    clone.style.transition = 'transform .28s cubic-bezier(.22,.61,.36,1)';
    novo.style.transform = 'translateX(0)';
    clone.style.transform = `translateX(${saindoPara})`;
  });

  let limpo = false;
  const limpar = () => {
    if (limpo) return;
    limpo = true;
    novo.removeEventListener('transitionend', aoTerminar);
    novo.style.transition = '';
    novo.style.transform = '';
    clone.remove();
  };
  // Sem conferir o alvo, um transitionend borbulhando de dentro do bloco
  // cortaria o slide no meio do caminho.
  function aoTerminar(e) {
    if (e.target === novo && e.propertyName === 'transform') limpar();
  }
  novo.addEventListener('transitionend', aoTerminar);
  setTimeout(limpar, 450);   // rede de segurança se o transitionend não vier
}

function renderAgenda() {
  document.getElementById('greeting').textContent = 'Agenda';
  document.getElementById('greetingSub').textContent = '';
  const day = state.agendaDate;
  const monthLabel = day.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const weekStart = startOfWeek(day);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayAppts = state.appointments.filter(a => sameDay(new Date(a.starts_at), day));

  const hours = [];
  for (let h = AGENDA_START_HOUR; h < AGENDA_END_HOUR; h++) hours.push(h);

  const blocksHtml = layoutAppts(dayAppts).map(it => {
    const a = it.a;
    const start = new Date(a.starts_at);
    const end = new Date(a.ends_at);
    const startMins = (start.getHours() - AGENDA_START_HOUR) * 60 + start.getMinutes();
    const durMins = Math.max(20, (end - start) / 60000);
    const top = (startMins / 60) * HOUR_HEIGHT;
    const height = (durMins / 60) * HOUR_HEIGHT - 4;
    const c = colorForService(a.service?.id);

    // Cada camada de sobreposição entra um pouco mais pra dentro; a borda
    // direita continua alinhada, então o bloco de baixo aparece à esquerda.
    const recuo = 6 + it.nivel * NIVEL_RECUO;
    const esquerda = `${recuo}px`;
    const largura = `calc(100% - ${recuo + 6}px)`;

    // Faixa de pausa, quando o serviço tiver uma.
    const seg = segmentsOf(a);
    let gapHtml = '';
    if (seg.gp > 0) {
      const gapTop = (seg.wb / 60) * HOUR_HEIGHT;
      const gapH = (seg.gp / 60) * HOUR_HEIGHT;
      const cabeRotulo = gapH >= 22;
      gapHtml = `<div class="appt-gap" style="top:${gapTop}px; height:${gapH}px;">
        ${cabeRotulo ? `<span class="gap-label">pausa · ${seg.gp}min</span>` : ''}
      </div>`;
    }

    const nome = a.client?.name || 'Cliente';
    const descricao = `${nome}, ${a.service?.name || 'atendimento'} com ${a.staff?.name || '—'}, `
      + `das ${fmtTime(a.starts_at)} às ${fmtTime(a.ends_at)}`
      + (seg.gp > 0 ? `, com ${seg.gp} minutos de pausa` : '');

    return `
      <button type="button" class="timeline-appt${seg.gp > 0 ? ' has-gap' : ''}${it.nivel > 0 ? ' nested' : ''}" data-appt-id="${a.id}"
           style="top:${top}px; height:${height}px; left:${esquerda}; width:${largura}; z-index:${it.nivel + 1};
                  background:${c.bg}; border-left:3px solid ${c.border};"
           aria-label="${descricao}" title="${nome} — ${fmtTime(a.starts_at)} às ${fmtTime(a.ends_at)}">
        ${gapHtml}
        <div class="title" style="color:${c.text}">${nome}</div>
        <div class="sub" style="color:${c.text}">${a.service?.name || ''} · ${a.staff?.name || ''}</div>
      </button>
    `;
  }).join('');

  // "Quarta — 29 jul 2026": o "-feira" e os pontos do pt-BR só ocupam espaço.
  const diaSemana = day.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
  const mesAbrev = day.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const dataPorExtenso = `${diaSemana} — ${day.getDate()} ${mesAbrev} ${day.getFullYear()}`;

  app.innerHTML = `
    <div class="agenda-head">
      <button class="month-pill" id="openMonthView" aria-label="Abrir calendário do mês">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        <span>${monthLabel.replace(/ de \d+$/, '')}</span>
      </button>
    </div>
    <div class="week-row">
      <button class="week-arrow" id="prevWeek" aria-label="Semana anterior">‹</button>
      <div class="week-strip">
        ${weekDays.map(d => {
          const selected = sameDay(d, day);
          const today = sameDay(d, new Date());
          const hasAppts = state.appointments.some(a => sameDay(new Date(a.starts_at), d));
          return `
            <button class="week-day ${selected ? 'selected' : ''} ${today ? 'is-today' : ''} ${hasAppts ? 'has-appts' : ''}" data-date="${d.toISOString()}">
              <div class="wd-label">${WEEKDAY_LABELS[d.getDay()]}</div>
              <div class="wd-num">${d.getDate()}</div>
              <div class="wd-dot"></div>
            </button>
          `;
        }).join('')}
      </div>
      <button class="week-arrow" id="nextWeek" aria-label="Próxima semana">›</button>
    </div>
    <div class="agenda-date">${dataPorExtenso}</div>
    <div class="timeline-viewport">
      <div class="timeline">
        <div class="timeline-body" style="height:${(AGENDA_END_HOUR - AGENDA_START_HOUR) * HOUR_HEIGHT}px;">
          ${hours.map((h, i) => `
            <div class="hour-row" style="position:absolute; top:${i * HOUR_HEIGHT}px; left:0; right:0; height:${HOUR_HEIGHT}px;">
              <div class="hour-label">${fmtHoraCheia(h)}</div>
            </div>
          `).join('')}
          ${blocksHtml}
        </div>
      </div>
    </div>
  `;

  document.getElementById('prevWeek').onclick = () => irParaDia(new Date(day.getTime() - 7 * 86400000));
  document.getElementById('nextWeek').onclick = () => irParaDia(new Date(day.getTime() + 7 * 86400000));
  document.getElementById('openMonthView').onclick = () => openMonthCalendar(day);

  app.querySelectorAll('.week-day').forEach(btn => {
    btn.onclick = () => irParaDia(new Date(btn.dataset.date));
  });

  app.querySelectorAll('.timeline-appt[data-appt-id]').forEach(block => {
    block.onclick = async () => {
      const apptId = block.dataset.apptId;
      if (!state.apptPhotos[apptId]) await loadApptPhotos(apptId);
      state.selectedApptId = apptId;
      render();
    };
  });
}

function openMonthCalendar(initialDate) {
  let viewDate = new Date(initialDate);
  viewDate.setDate(1);

  const overlay = document.createElement('div');
  overlay.className = 'month-cal-overlay';
  document.body.appendChild(overlay);

  function closeCal() {
    overlay.remove();
  }

  function renderCal() {
    const monthLabel = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const gridStart = startOfWeek(firstOfMonth);
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      return d;
    });

    overlay.innerHTML = `
      <div class="month-cal-card">
        <div class="month-cal-header">
          <button class="arrow" id="calPrevMonth" aria-label="Mês anterior">‹</button>
          <div class="day-label">${monthLabel}</div>
          <button class="arrow" id="calNextMonth" aria-label="Próximo mês">›</button>
        </div>
        <div class="month-cal-weekdays">
          ${WEEKDAY_LABELS.map(l => `<div>${l}</div>`).join('')}
        </div>
        <div class="month-cal-grid">
          ${cells.map(d => {
            const inMonth = d.getMonth() === viewDate.getMonth();
            const today = sameDay(d, new Date());
            const selected = sameDay(d, initialDate);
            const hasAppts = state.appointments.some(a => sameDay(new Date(a.starts_at), d));
            return `
              <button class="month-cal-day ${selected ? 'selected' : ''} ${today ? 'is-today' : ''} ${hasAppts ? 'has-appts' : ''} ${!inMonth ? 'is-outside' : ''}" data-date="${d.toISOString()}">
                <span>${d.getDate()}</span>
                <div class="wd-dot"></div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    overlay.querySelector('#calPrevMonth').onclick = (e) => {
      e.stopPropagation();
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCal();
    };
    overlay.querySelector('#calNextMonth').onclick = (e) => {
      e.stopPropagation();
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCal();
    };
    overlay.querySelectorAll('.month-cal-day').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const escolhido = new Date(btn.dataset.date);
        closeCal();
        irParaDia(escolhido);   // mesmo slide de quando se troca o dia na tira
      };
    });
  }

  overlay.onclick = closeCal;
  renderCal();
}

function clientStats(clientId) {
  const history = state.appointments
    .filter(a => a.client?.id === clientId)
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));
  const visits = history.length;
  const spent = history.reduce((sum, a) => sum + Number(a.service?.price || 0), 0);
  const lastVisit = history[0] ? fmtDate(history[0].starts_at) : '—';
  const isVip = visits >= 5;

  const freq = {};
  history.forEach(a => {
    const name = a.service?.name;
    if (name) freq[name] = (freq[name] || 0) + 1;
  });
  const favoriteServices = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return { history, visits, spent, lastVisit, isVip, favoriteServices };
}
