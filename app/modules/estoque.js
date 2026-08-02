/* Orenzi — aba Estoque do painel.
 *
 * Primeiro pedaço tirado de painel.html. Era o assunto mais isolado do arquivo:
 * ninguém de fora chama nada daqui além de renderStock() e openProductModal(),
 * e daqui pra fora só se usa o que o painel já expõe (state, sb, render,
 * showToast, closeModal, modalContainer, app).
 *
 * Script clássico, carregado ANTES do <script> inline do painel — igual ao
 * shared/salon.js. As funções só tocam nas variáveis do painel na hora em que
 * são chamadas, e nesse momento o inline já rodou.
 */

const UNIDADES = ['un', 'ml', 'g', 'cx'];

// Quantidade sem casas decimais à toa: 3 em vez de 3.00, mas 2.5 continua 2,5.
function fmtQtd(n) {
  const v = Number(n);
  return (Number.isInteger(v) ? v : v.toFixed(2).replace(/0$/, '')).toString().replace('.', ',');
}

function precisaRepor(p) {
  return Number(p.quantity) <= Number(p.min_quantity);
}

async function loadProducts() {
  const { data, error } = await sb.from('products').select('*').eq('active', true).order('name');
  if (error) { console.error(error); return; }
  state.products = data;
}

function renderStock() {
  document.getElementById('greeting').textContent = 'Estoque';
  const repor = state.products.filter(precisaRepor);
  document.getElementById('greetingSub').textContent =
    repor.length ? `${repor.length} produto(s) para repor` : 'Tudo em dia';

  // Quem está no fim primeiro: é o que precisa de decisão hoje.
  const lista = [...state.products].sort((a, b) => (precisaRepor(b) - precisaRepor(a)) || a.name.localeCompare(b.name));

  app.innerHTML = `
    <h2>Produtos</h2>
    ${lista.length ? lista.map(p => `
      <div class="stock-row${precisaRepor(p) ? ' low' : ''}">
        <button type="button" class="stock-info" data-edit="${p.id}" aria-label="Editar ${p.name}">
          <div class="title">${p.name}</div>
          <div class="sub">${[p.brand, p.category].filter(Boolean).join(' · ') || 'Sem marca'} · mínimo ${fmtQtd(p.min_quantity)} ${p.unit}</div>
        </button>
        <div class="stock-qty">
          <button type="button" class="qty-btn" data-dec="${p.id}" aria-label="Tirar 1 de ${p.name}">−</button>
          <div class="qty-num">${fmtQtd(p.quantity)}<span class="qty-unit">${p.unit}</span></div>
          <button type="button" class="qty-btn" data-inc="${p.id}" aria-label="Adicionar 1 em ${p.name}">+</button>
        </div>
      </div>
    `).join('') : '<div class="empty">Nenhum produto cadastrado. Use o + para incluir o primeiro.</div>'}
  `;

  app.querySelectorAll('[data-edit]').forEach(el => {
    el.onclick = () => openProductModal(el.dataset.edit);
  });
  app.querySelectorAll('[data-inc]').forEach(el => {
    el.onclick = () => ajustarQuantidade(el.dataset.inc, 1);
  });
  app.querySelectorAll('[data-dec]').forEach(el => {
    el.onclick = () => ajustarQuantidade(el.dataset.dec, -1);
  });
}

// Ajuste rápido do balcão: usou um, tira um. Atualiza a tela na hora e só
// depois confirma no banco — se der erro, volta ao valor anterior.
async function ajustarQuantidade(id, delta) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const anterior = Number(p.quantity);
  const nova = Math.max(0, anterior + delta);
  if (nova === anterior) return;
  p.quantity = nova;
  renderStock();

  // O .select() é o que prova que gravou: com a sessão expirada a RLS deixa o
  // update passar sem tocar em nenhuma linha, e sem isso a tela mentiria.
  const { data, error } = await sb.from('products')
    .update({ quantity: nova, updated_at: new Date().toISOString() }).eq('id', id).select('id');
  if (error || !data || !data.length) {
    p.quantity = anterior;
    renderStock();
    showToast(error ? 'Não deu pra salvar: ' + error.message : 'Não foi possível salvar — faça login novamente.');
    return;
  }
  if (precisaRepor(p)) showToast(`${p.name} chegou no mínimo — hora de repor`);
}

// ── Produto: cadastro e edição ───────────────────────────────
function openProductModal(id) {
  const p = id ? state.products.find(x => x.id === id) : null;
  const v = (x, alt = '') => (x == null ? alt : String(x));

  modalContainer.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-sheet">
        <button class="modal-close" id="modalClose" aria-label="Fechar">✕</button>
        <h2>${p ? 'Editar produto' : 'Novo produto'}</h2>

        <label for="prodName">Produto</label>
        <input type="text" id="prodName" placeholder="Ex.: Pó descolorante" value="${p ? v(p.name).replace(/"/g, '&quot;') : ''}">

        <label for="prodBrand">Marca</label>
        <input type="text" id="prodBrand" placeholder="Ex.: Wella" value="${p ? v(p.brand).replace(/"/g, '&quot;') : ''}">

        <label for="prodCategory">Categoria</label>
        <input type="text" id="prodCategory" placeholder="Ex.: Coloração" value="${p ? v(p.category).replace(/"/g, '&quot;') : ''}">

        <div class="seg-row">
          <div>
            <label for="prodQty">Quantidade</label>
            <input type="number" id="prodQty" min="0" step="0.5" inputmode="decimal" value="${p ? v(p.quantity, '0') : '0'}">
          </div>
          <div>
            <label for="prodMin">Mínimo</label>
            <input type="number" id="prodMin" min="0" step="0.5" inputmode="decimal" value="${p ? v(p.min_quantity, '0') : '0'}">
          </div>
          <div>
            <label for="prodUnit">Unidade</label>
            <select id="prodUnit" style="border-radius:999px;">
              ${UNIDADES.map(u => `<option value="${u}" ${p && p.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="slot-note">O aviso de repor aparece quando a quantidade chega no mínimo.</div>

        <label for="prodCost">Custo por unidade (€)</label>
        <input type="number" id="prodCost" min="0" step="0.01" inputmode="decimal" value="${p && p.cost != null ? v(p.cost) : ''}">

        <label for="prodNotes">Observações</label>
        <textarea id="prodNotes" placeholder="Fornecedor, validade, onde fica guardado…">${p ? v(p.notes) : ''}</textarea>

        <button class="btn btn-primary" id="saveProduct">Salvar produto</button>
        ${p ? '<button class="btn btn-ghost" id="deleteProduct">Remover do estoque</button>' : ''}
        <div id="prodError"></div>
      </div>
    </div>
  `;

  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOverlay').onclick = (e) => { if (e.target.id === 'modalOverlay') closeModal(); };

  const erro = (msg) => {
    document.getElementById('prodError').innerHTML = msg ? `<div class="login-error">${msg}</div>` : '';
  };

  document.getElementById('saveProduct').onclick = async () => {
    const name = document.getElementById('prodName').value.trim();
    if (!name) { erro('Dê um nome ao produto.'); return; }
    const custo = document.getElementById('prodCost').value.trim();
    const payload = {
      name,
      brand: document.getElementById('prodBrand').value.trim() || null,
      category: document.getElementById('prodCategory').value.trim() || null,
      unit: document.getElementById('prodUnit').value,
      quantity: Math.max(0, Number(document.getElementById('prodQty').value) || 0),
      min_quantity: Math.max(0, Number(document.getElementById('prodMin').value) || 0),
      cost: custo === '' ? null : Number(custo),
      notes: document.getElementById('prodNotes').value.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = p
      ? await sb.from('products').update(payload).eq('id', p.id).select('id')
      : await sb.from('products').insert(payload).select('id');
    if (error) { erro(error.message); return; }
    if (!data || !data.length) { erro('Não foi possível salvar — faça login novamente.'); return; }
    closeModal();
    showToast(p ? 'Produto atualizado' : 'Produto cadastrado');
    await loadProducts();
    render();
  };

  const btnDel = document.getElementById('deleteProduct');
  if (btnDel) btnDel.onclick = async () => {
    // Some da lista mas o registro fica: o histórico de custo não se perde.
    const { data, error } = await sb.from('products')
      .update({ active: false, updated_at: new Date().toISOString() }).eq('id', p.id).select('id');
    if (error) { erro(error.message); return; }
    if (!data || !data.length) { erro('Não foi possível remover — faça login novamente.'); return; }
    closeModal();
    showToast('Produto removido do estoque');
    await loadProducts();
    render();
  };
}
