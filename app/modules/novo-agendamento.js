/* Orenzi — modal "Novo agendamento" do painel (botão +).
 *
 * Quarto pedaço tirado de painel.html. Monta o rascunho, calcula a grade de
 * horários com a regra de shared/salon.js e grava o agendamento.
 *
 * `modalContainer` continua no painel de propósito: é um getElementById que roda
 * na hora, e o inline é o único script que executa depois do DOM existir.
 * Daqui saem também closeModal() e profissionaisAtivos(), usados por outras
 * telas — script clássico compartilha o escopo global, então elas enxergam.
 */

// Rascunho do agendamento em edição. Fica fora do render porque a grade de
// horários é recalculada a cada mudança — sem isso o formulário perderia o
// que já foi preenchido a cada recálculo.
let draft = null;

// Quem realmente atende. Com uma pessoa só — hoje, a Juliane — não faz sentido
// pedir a escolha: o agendamento já sai no nome dela.
function profissionaisAtivos() {
  return state.staff.filter(s => s.active !== false);
}

function novoRascunho() {
  const ativos = profissionaisAtivos();
  return {
    clientMode: 'existing',   // 'existing' | 'new'
    clientId: '',
    newName: '', newPhone: '', newEmail: '',
    serviceId: '',
    staffId: ativos.length === 1 ? ativos[0].id : '',
    date: salonToday(),
    wb: 0, gp: 0, wa: 0,      // trabalho inicial / pausa / trabalho final
    slotMin: null,            // horário escolhido, em minutos desde a meia-noite no salão
    slots: [],
    mostrarOcupados: false,   // libera o clique nos horários sobrepostos
    error: null,
  };
}

function closeModal() {
  modalContainer.innerHTML = '';
  draft = null;
}

function openNewApptModal() {
  draft = novoRascunho();
  renderNewApptModal();
}

function duracaoTotal() {
  return draft.wb + draft.gp + draft.wa;
}

function fmtDuracao(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

// Cada recálculo ganha um número; respostas de pedidos antigos que chegarem
// atrasadas são descartadas em vez de sobrescrever a grade atual.
let slotToken = 0;

async function carregarSlots() {
  const meuToken = ++slotToken;
  const { serviceId, staffId, date } = draft;
  const total = duracaoTotal();
  if (!serviceId || !staffId || !date || total <= 0) { draft.slots = []; return; }

  // Mesma leitura e mesma regra da página da cliente, de shared/salon.js.
  const ocupacao = await fetchOccupancy(sb, staffId, date, state.chairs);
  if (meuToken !== slotToken) return;
  if (ocupacao.error) { draft.slots = []; draft.error = ocupacao.error.message; return; }

  const seg = { wb: draft.wb, gp: draft.gp, wa: draft.wa };
  const slots = [];
  for (let m = OPEN_HOUR * 60; m + total <= CLOSE_HOUR * 60; m += SLOT_MINUTES) {
    const inicio = salonTimeToInstant(date, m);
    const status = slotStatus(inicio.getTime(), seg, ocupacao);
    slots.push({
      min: m,
      label: salonClock(inicio),
      livre: status.livre,
      motivo: status.motivo,
    });
  }
  draft.slots = slots;
  // A duração pode ter mudado e derrubado o horário que estava escolhido.
  if (!slots.some(s => s.min === draft.slotMin)) draft.slotMin = null;
}

async function refreshSlots() {
  const area = document.getElementById('slotsArea');
  if (!area) return;
  if (!draft.serviceId || !draft.staffId || !draft.date || duracaoTotal() <= 0) {
    draft.slots = [];
    draft.slotMin = null;
    const falta = profissionaisAtivos().length > 1 ? 'serviço, profissional e data' : 'o serviço e a data';
    area.innerHTML = `<label>Horário</label>
      <div class="slot-note">Escolha ${falta} para ver os horários.</div>`;
    renderAviso();
    return;
  }
  area.innerHTML = `<label>Horário</label><div class="slot-note">Carregando horários…</div>`;
  await carregarSlots();
  renderSlots();
}

function renderSlots() {
  const area = document.getElementById('slotsArea');
  if (!area) return;
  const livres = draft.slots.filter(s => s.livre).length;

  area.innerHTML = draft.slots.length ? `
    <label>Horário</label>
    <div class="time-grid">
      ${draft.slots.map(s => {
        const podeClicar = s.livre || draft.mostrarOcupados;
        const selecionado = draft.slotMin === s.min;
        const porque = s.motivo === 'agenda'
          ? 'A profissional está em trabalho nesse intervalo'
          : 'Todas as cadeiras estarão ocupadas';
        return `
          <button type="button" class="time-item${s.livre ? '' : ' busy'}${selecionado ? ' selected' : ''}"
            data-min="${s.min}" ${podeClicar ? '' : 'disabled'}
            title="${s.livre ? 'Livre' : porque}"
            aria-label="${s.label}${s.livre ? '' : ' — ' + porque}">
            <span class="hh">${s.label}</span>
            ${s.livre ? '' : `<span class="why">${s.motivo === 'agenda' ? 'ocupada' : 'sem cadeira'}</span>`}
          </button>
        `;
      }).join('')}
    </div>
    <button type="button" class="link-btn" id="toggleBusy">
      ${draft.mostrarOcupados ? 'Esconder horários ocupados' : 'Liberar horários ocupados (encaixe)'}
    </button>
    <div class="slot-note">${livres} de ${draft.slots.length} horários livres nesse dia.</div>
  ` : `
    <label>Horário</label>
    <div class="slot-note">Nenhum horário cabe nesse dia com ${fmtDuracao(duracaoTotal())} de atendimento.</div>
  `;

  area.querySelectorAll('.time-item:not(:disabled)').forEach(el => {
    el.onclick = () => {
      draft.slotMin = Number(el.dataset.min);
      renderSlots();
    };
  });
  const toggle = document.getElementById('toggleBusy');
  if (toggle) toggle.onclick = () => {
    draft.mostrarOcupados = !draft.mostrarOcupados;
    // Ao esconder de novo, um horário sobreposto que estava escolhido cai fora.
    if (!draft.mostrarOcupados) {
      const s = draft.slots.find(x => x.min === draft.slotMin);
      if (s && !s.livre) draft.slotMin = null;
    }
    renderSlots();
  };
  renderAviso();
}

// Quando o horário escolhido está sobreposto, deixa explícito o que vai
// acontecer — nada é bloqueado, mas ninguém cria um encaixe sem perceber.
function renderAviso() {
  const el = document.getElementById('apptWarn');
  if (!el) return;
  const s = draft.slots.find(x => x.min === draft.slotMin);
  if (!s || s.livre) { el.innerHTML = ''; return; }
  const porque = s.motivo === 'agenda'
    ? 'a profissional já está em trabalho nesse intervalo'
    : 'todas as cadeiras já estarão ocupadas';
  el.innerHTML = `<div class="slot-warn">Encaixe às ${s.label}: ${porque}.
    O agendamento vai ser criado sobreposto mesmo assim.</div>`;
}

function mostrarErro(msg) {
  draft.error = msg || null;
  const el = document.getElementById('apptError');
  if (el) el.innerHTML = msg ? `<div class="login-error">${msg}</div>` : '';
}

function renderNewApptModal() {
  const totalLabel = duracaoTotal() > 0 ? fmtDuracao(duracaoTotal()) : '—';

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-sheet">
        <button class="modal-close" id="modalClose" aria-label="Fechar">✕</button>
        <h2>Novo agendamento</h2>

        <div class="toggle-row">
          <button id="modeExisting" class="${draft.clientMode === 'existing' ? 'active' : ''}">Cliente existente</button>
          <button id="modeNew" class="${draft.clientMode === 'new' ? 'active' : ''}">Novo cliente</button>
        </div>

        <div id="clientFields"></div>

        <label for="serviceSelect">Serviço</label>
        <select id="serviceSelect">
          <option value="">Selecione…</option>
          ${state.services.map(s => `<option value="${s.id}" ${draft.serviceId === s.id ? 'selected' : ''}>${s.name} (${s.duration_minutes} min)</option>`).join('')}
        </select>

        ${profissionaisAtivos().length > 1 ? `
          <label for="staffSelect">Profissional</label>
          <select id="staffSelect">
            <option value="">Selecione…</option>
            ${profissionaisAtivos().map(s => `<option value="${s.id}" ${draft.staffId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        ` : ''}

        <label for="apptDate">Data</label>
        <input type="date" id="apptDate" value="${draft.date}">

        <div class="seg-row">
          <div>
            <label for="segBefore">Trabalho</label>
            <input type="number" id="segBefore" min="0" step="5" inputmode="numeric" value="${draft.wb}">
          </div>
          <div>
            <label for="segGap">Pausa</label>
            <input type="number" id="segGap" min="0" step="5" inputmode="numeric" value="${draft.gp}">
          </div>
          <div>
            <label for="segAfter">Finalização</label>
            <input type="number" id="segAfter" min="0" step="5" inputmode="numeric" value="${draft.wa}">
          </div>
        </div>
        <div class="slot-note" id="segNote">
          Minutos. Durante a pausa a cadeira e a profissional ficam livres pra outro
          atendimento. Total: <strong>${totalLabel}</strong>
        </div>

        <div id="slotsArea"></div>
        <div id="apptWarn"></div>

        <button class="btn btn-primary" id="saveAppt">Salvar agendamento</button>
        <div id="apptError">${draft.error ? `<div class="login-error">${draft.error}</div>` : ''}</div>
      </div>
    </div>
  `;

  function renderClientFields() {
    const wrap = document.getElementById('clientFields');
    if (draft.clientMode === 'existing') {
      wrap.innerHTML = `
        <label for="clientSelect">Cliente</label>
        <select id="clientSelect">
          <option value="">Selecione…</option>
          ${state.clients.map(c => `<option value="${c.id}" ${draft.clientId === c.id ? 'selected' : ''}>${c.name}${c.phone ? ' · ' + c.phone : ''}</option>`).join('')}
        </select>
      `;
      document.getElementById('clientSelect').onchange = (e) => { draft.clientId = e.target.value; };
    } else {
      wrap.innerHTML = `
        <label for="newClientName">Nome do cliente</label>
        <input type="text" id="newClientName" autocomplete="name" placeholder="Nome completo" value="${draft.newName}">
        <label for="newClientPhone">Telefone</label>
        <input type="tel" id="newClientPhone" autocomplete="tel" placeholder="+353 ..." value="${draft.newPhone}">
        <label for="newClientEmail">E-mail</label>
        <input type="email" id="newClientEmail" autocomplete="email" placeholder="cliente@email.com" value="${draft.newEmail}">
      `;
      document.getElementById('newClientName').oninput = (e) => { draft.newName = e.target.value; };
      document.getElementById('newClientPhone').oninput = (e) => { draft.newPhone = e.target.value; };
      document.getElementById('newClientEmail').oninput = (e) => { draft.newEmail = e.target.value; };
    }
  }
  renderClientFields();

  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOverlay').onclick = (e) => { if (e.target.id === 'modalOverlay') closeModal(); };
  document.getElementById('modeExisting').onclick = () => {
    draft.clientMode = 'existing'; renderClientFields();
    document.getElementById('modeExisting').classList.add('active');
    document.getElementById('modeNew').classList.remove('active');
  };
  document.getElementById('modeNew').onclick = () => {
    draft.clientMode = 'new'; renderClientFields();
    document.getElementById('modeNew').classList.add('active');
    document.getElementById('modeExisting').classList.remove('active');
  };

  // Trocar de serviço repõe os segmentos padrão dele — o ajuste manual vale
  // pro atendimento em edição, não vira o novo padrão do serviço.
  document.getElementById('serviceSelect').onchange = (e) => {
    draft.serviceId = e.target.value;
    const s = state.services.find(x => x.id === draft.serviceId);
    if (s) {
      draft.wb = s.work_before_minutes != null ? s.work_before_minutes : s.duration_minutes;
      draft.gp = s.gap_minutes || 0;
      draft.wa = s.work_after_minutes || 0;
    } else {
      draft.wb = draft.gp = draft.wa = 0;
    }
    document.getElementById('segBefore').value = draft.wb;
    document.getElementById('segGap').value = draft.gp;
    document.getElementById('segAfter').value = draft.wa;
    atualizarTotal();
    refreshSlots();
  };
  const staffSelect = document.getElementById('staffSelect');   // ausente quando só há uma profissional
  if (staffSelect) staffSelect.onchange = (e) => { draft.staffId = e.target.value; refreshSlots(); };
  document.getElementById('apptDate').onchange = (e) => { draft.date = e.target.value; refreshSlots(); };

  function atualizarTotal() {
    const nota = document.getElementById('segNote');
    if (nota) nota.querySelector('strong').textContent = duracaoTotal() > 0 ? fmtDuracao(duracaoTotal()) : '—';
  }

  // Digitar "120" dispararia três recálculos; espera a digitação parar.
  let segTimer = null;
  [['segBefore', 'wb'], ['segGap', 'gp'], ['segAfter', 'wa']].forEach(([id, campo]) => {
    document.getElementById(id).oninput = (e) => {
      draft[campo] = Math.max(0, Number(e.target.value) || 0);
      atualizarTotal();
      clearTimeout(segTimer);
      segTimer = setTimeout(refreshSlots, 300);
    };
  });

  refreshSlots();

  document.getElementById('saveAppt').onclick = async () => {
    try {
      const { serviceId, staffId, date, slotMin } = draft;
      if (!staffId) { mostrarErro('Nenhuma profissional ativa cadastrada.'); return; }
      if (!serviceId || !date || slotMin == null) {
        mostrarErro('Escolha o serviço, a data e um horário.');
        return;
      }
      if (draft.wb <= 0) {
        mostrarErro('O trabalho inicial precisa ter pelo menos alguns minutos.');
        return;
      }

      let clientId;
      if (draft.clientMode === 'existing') {
        clientId = draft.clientId;
        if (!clientId) { mostrarErro('Selecione um cliente.'); return; }
      } else {
        const name = draft.newName.trim();
        const phone = draft.newPhone.trim();
        const email = draft.newEmail.trim();
        if (!name || !phone) { mostrarErro('Preencha nome e telefone do novo cliente.'); return; }
        const normalizedPhone = phone.replace(/[^\d]/g, '');
        const { data: existing } = await sb.from('clients').select('id').eq('phone', normalizedPhone).maybeSingle();
        if (existing) {
          clientId = existing.id;
        } else {
          const { data: created, error: createErr } = await sb
            .from('clients').insert({ name, phone: normalizedPhone, email: email || null }).select('id').single();
          if (createErr) throw createErr;
          clientId = created.id;
        }
      }

      const startsAt = salonTimeToInstant(date, slotMin);
      const endsAt = new Date(startsAt.getTime() + duracaoTotal() * 60000);

      // Os segmentos vão gravados no próprio agendamento: é o que faz a agenda
      // desenhar a pausa certa e o que abre o encaixe pra quem marcar depois.
      const { error: apptErr } = await sb.from('appointments').insert({
        client_id: clientId,
        staff_id: staffId,
        service_id: serviceId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        work_before_minutes: draft.wb,
        gap_minutes: draft.gp,
        work_after_minutes: draft.wa,
        status: 'confirmed',
      });
      if (apptErr) throw apptErr;

      closeModal();
      showToast('Agendamento criado');
      await loadAll();
    } catch (e) {
      mostrarErro(e.message);
    }
  };
}
