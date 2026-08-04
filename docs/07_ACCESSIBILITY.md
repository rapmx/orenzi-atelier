# 07 — Accessibility

**Versão 1.0 · 03/08/2026**

Requisitos mínimos para o webapp atual e para um eventual aplicativo instalável.

> **Estado atual, sem rodeios:** o Orenzi **não atende WCAG AA hoje**. Os
> problemas estão listados por prioridade na §19. Nenhum deles é grande
> isoladamente; juntos, tornam o produto inutilizável por teclado e hostil a
> leitor de tela.

---

## 1. Compromisso de acessibilidade

**Alvo: WCAG 2.1 nível AA.**

Quem usa o Orenzi trabalha em pé, com as mãos ocupadas, muitas vezes com luz
ruim e sempre com pressa. Acessibilidade aqui não é conformidade abstrata — é a
mesma coisa que usabilidade sob estresse.

Três compromissos que não se negociam:

1. **Nenhuma informação é comunicada só por cor.**
2. **Tudo que se faz com o dedo se faz com o teclado.**
3. **Nada é gravado sem que a tela diga a verdade sobre isso.**

---

## 2. Contraste

**Mínimos:** texto normal 4,5:1 · texto grande (≥24px, ou ≥19px em negrito) 3:1
· elemento gráfico com significado 3:1.

Medições completas em [03 §6](03_DESIGN_SYSTEM.md#6-contraste-e-uso-correto).
Resumo dos problemas:

| Par | Razão | Situação |
|---|---|---|
| Texto do CTA primário sobre `--color-accent` | **3,12:1** | **reprova — P0** |
| Branco sobre `--color-accent` (toast, iniciais) | **3,64:1** | reprova — P1 |
| `--color-divider` sobre fundo | 1,32:1 | decorativo; não pode ser o único delimitador de um controle |

**Regras.**
1. Toda combinação nova é **medida**, nunca estimada.
2. `--color-accent` e `--color-accent-600` não são cores de texto sobre fundo
   claro. Para texto, `--color-accent-700`.
3. Cor de estado em texto usa sempre a variante `-700`.
4. Estado nunca depende só de cor — ver §12.

---

## 3. Tipografia e zoom

- Tamanho mínimo de texto legível: **11px**, reservado a badge e rótulo de aba.
  Texto de leitura: 13px ou mais.
- Nada de texto em imagem.
- Altura de linha mínima de 1,4 em blocos de leitura.
- **Zoom de texto até 200% sem perda de função.**
- Nenhum layout depende de comprimento fixo de texto.

⚠ **PENDENTE:** o zoom de 200% nunca foi testado. Provável ponto de quebra: as
grades de métricas e as faixas de chips. Testar antes de declarar conformidade.

⚠ **PENDENTE:** em iOS, campo com fonte abaixo de 16px provoca zoom automático
ao focar. O corpo do produto é 15px. Verificar se ocorre e decidir entre 16px
nos campos ou ajuste de viewport — **não decidir sem teste**.

---

## 4. Touch targets

**Mínimo absoluto: 44×44px.** Sem exceção.

Quando o desenho pede um controle menor, a área é estendida com um
pseudo-elemento invisível — técnica já usada corretamente nos botões de
quantidade do estoque (38px de desenho, 46px de área).

**Violações atuais:**

| Controle | Tamanho | Área estendida? |
|---|---|---|
| Botão de ajuda dos indicadores | **18px** | não |
| Botão de excluir foto | **26px** | não |
| Setas do seletor de mês | **28px** | não |
| Botões de quantidade | 38px | **sim** (46px) ✅ |

**P0.** Ver §19.

**Espaçamento entre alvos:** mínimo de 8px entre dois alvos adjacentes.

---

## 5. Teclado

Tudo que se faz com o dedo se faz com o teclado.

| Tecla | Comportamento |
|---|---|
| `Tab` / `Shift+Tab` | percorre na ordem visual |
| `Enter` / `Espaço` | ativa botão e link |
| `Esc` | fecha folha, modal e diálogo |
| Setas | navega dentro de grupo (dias, chips, opções) |

**Regras.**
1. **Ordem de foco segue a ordem visual.** Nada de salto por causa de posição
   absoluta.
2. Nenhuma armadilha de foco fora de modal.
3. Elemento não interativo não recebe foco.
4. `<div>` com manipulador de clique é proibido — usar `<button>`.
5. Ação destrutiva **nunca** é o primeiro elemento focado.

⚠ **Estado atual:** os controles são `<button>` nativos (bom sinal), mas sem
foco visível a navegação por teclado é cega na prática.

---

## 6. Focus

**O indicador de foco é obrigatório e não pode ser removido.**

```
:focus-visible → box-shadow: var(--focus-ring)   /* sem transição */
```

**Regras.**
1. `:focus-visible`, não `:focus` — o anel não aparece em toque ou clique de
   mouse.
2. `outline: none` só é permitido **junto com** um substituto visível.
3. Contraste do anel ≥3:1 contra o fundo adjacente.
4. O anel nunca é reduzido por preferência de movimento reduzido.
5. Ao fechar folha ou modal, o foco volta ao elemento que o abriu.

⚠ **Estado atual: zero ocorrências de `:focus-visible` nos quatro arquivos.**
Existem dois `outline: none` explícitos sem substituto (campo de busca do painel
e campo de `agendar.html`). O anel de foco visual do campo de busca depende de
uma classe aplicada por JS — não funciona por teclado. **P0.**

---

## 7. Inputs e labels

**Todo campo tem um `<label>` associado por `for`/`id`.**

```
<label for="clientName">Nome</label>
<input id="clientName" type="text">
```

**Regras.**
1. Placeholder nunca é o rótulo.
2. Erro ligado por `aria-describedby`, com `aria-invalid` no campo.
3. Campo obrigatório indicado no rótulo **e** com `required`.
4. Tipo nativo correto (`tel`, `email`, `number`, `date`) — muda o teclado.
5. `autocomplete` nos campos pessoais.
6. Agrupamento de opções relacionadas com `fieldset` e `legend`.

⚠ **Estado atual: nenhum `for=` existe no projeto.** Os 20 rótulos do painel e
os 6 de `agendar.html` são texto solto. Leitor de tela anuncia "campo de edição"
sem dizer de quê. **P0.**

---

## 8. Modais e bottom sheets

Requisitos completos, nenhum atendido hoje:

1. `role="dialog"` + `aria-modal="true"` (`role="alertdialog"` para confirmação
   destrutiva).
2. `aria-labelledby` apontando para o título.
3. **Captura de foco** — `Tab` circula dentro da folha.
4. Foco inicial no primeiro elemento interativo, **nunca** no botão destrutivo.
5. **Restauração de foco** ao fechar, no elemento que abriu.
6. `Esc` fecha.
7. Conteúdo de fundo inerte, não só visualmente coberto.
8. Fundo não rola por trás.

⚠ **Estado atual: zero `role=` nos quatro arquivos.** Nenhuma captura,
nenhuma restauração de foco. **P0.**

---

## 9. Leitores de tela

**Regras.**
1. HTML semântico antes de ARIA: `<button>`, `<nav>`, `<main>`, `<header>`,
   `<h1>`–`<h3>`.
2. `aria-label` em todo controle sem texto visível.
3. Ícone decorativo com `aria-hidden="true"`.
4. Imagem com `alt` descritivo; decorativa com `alt=""`.
5. Hierarquia de títulos sem pular nível.
6. `lang="pt-BR"` no documento ✅ (já correto nos quatro arquivos).
7. Nome acessível de botão descreve a ação **e o objeto**: "Cadastrar produto",
   não "Adicionar".

⚠ **Estado atual:** `aria-label` existe mas é esparso — 16 no painel, **1 em
`agendar.html`**, 13 na landing. A página da cliente é a mais crítica: é usada
por pessoas que nunca viram o produto. **P1.**

---

## 10. Dynamic content

Todo conteúdo que muda sem recarregar precisa ser anunciado.

| Situação | Anúncio |
|---|---|
| Resultado de busca mudou | `aria-live="polite"` com a contagem |
| Filtro aplicado | `aria-live="polite"` |
| Quantidade alterada | `aria-live="polite"` com o novo valor |
| Carregando | `aria-busy="true"` no container |
| Erro apareceu | `role="alert"` (interrompe) |

**Regras.** `polite` por padrão; `assertive`/`alert` só para erro. Nunca anunciar
cada item de uma lista longa — anunciar o resumo ("12 clientes encontradas").

⚠ **Estado atual: zero `aria-live` no projeto.** Buscar, filtrar e alterar
quantidade são mudanças completamente silenciosas para leitor de tela. **P1.**

---

## 11. Toasts

- `role="status"` + `aria-live="polite"`.
- Não recebe foco — não interrompe o que a pessoa está fazendo.
- Duração mínima de 3s; com ação ("Desfazer"), 5s e alvo de 44px.
- **Não é o único canal de uma informação importante.** Se a pessoa precisar
  reler, é `Banner`.

⚠ **Estado atual:** o toast existe, sem `role` e sem `aria-live`. **P1.**

---

## 12. Estados

**Regra fundadora: nenhuma informação é comunicada só por cor.**

Todo estado é comunicado por **cor + texto** ou **cor + forma + texto**.

| Padrão | Correto |
|---|---|
| Estado de cliente | ponto colorido **+ rótulo em texto ao lado** ✅ |
| Estado de estoque | cor + badge com texto ✅ |
| Categoria de serviço | cor + nome do serviço ✅ |
| Variação de indicador | seta + sinal em texto |

**Teste:** em escala de cinza, a tela ainda comunica tudo?

✅ **Este é o ponto mais forte do produto hoje.** Preservar.

---

## 13. Erros

1. Erro de campo aparece **junto ao campo**, não em alerta no topo.
2. Ligado por `aria-describedby` + `aria-invalid="true"`.
3. Erro de tela usa `role="alert"`.
4. Ao falhar o envio, o foco vai ao primeiro campo com erro.
5. Mensagem sem termo técnico ([06 §14](06_CONTENT_GUIDELINES.md)).
6. Erro nunca é comunicado só por borda vermelha — precisa de texto.

⚠ **Falha silenciosa é a pior violação possível.** Com a sessão expirada, uma
gravação pode "passar" sem alterar nenhuma linha. A tela **não pode** mostrar
sucesso nesse caso.

---

## 14. Motion

`prefers-reduced-motion: reduce` desliga movimento de posição e escala.
Tabela completa em [05 §21](05_MOTION_SYSTEM.md).

**Duas camadas obrigatórias:** o bloco CSS **e** a verificação em JS no início de
toda animação orquestrada em código.

⚠ **Estado atual:** `painel.html` tem 4 blocos e verifica em JS ✅.
**`agendar.html` não tem nenhum** — é a página da cliente, com transições de
passo animadas, usada por pessoas com vestibulopatia sem que saibamos. **P0.**

---

## 15. Safe areas

⚠ **Nenhum tratamento existe hoje.** A barra inferior usa um padding fixo de
20px que funciona por acaso.

**Requisitos.**
1. Barra de navegação e botões flutuantes somam a área segura inferior.
2. O `padding-bottom` do corpo acompanha a altura real da barra mais a área
   segura.
3. Folhas inferiores respeitam a área segura no seu fim.
4. Em modo paisagem, respeitar também as áreas laterais.

**P1.**

---

## 16. Responsividade

- Funciona em 320, 390 e 430px.
- Nada é cortado ou fica inacessível em 320px.
- Rolagem horizontal só onde é intencional (chips, galeria) — **o corpo da
  página nunca rola na horizontal**.
- Orientação paisagem não quebra a tela (não é otimizada, mas é utilizável).
- No desktop, o canvas centralizado inclui cabeçalho, rodapé e botões
  flutuantes.

⚠ **Estado atual:** um único ponto de quebra, em 360px. Cabeçalho, barra
inferior e botões flutuantes não respeitam o canvas no desktop. **P0** (é
também um item de contrato de UI, ver [03 §17](03_DESIGN_SYSTEM.md)).

---

## 17. Checklist WCAG AA

| Critério | Situação |
|---|---|
| 1.1.1 Conteúdo não textual | ⚠ parcial — `aria-label` esparso |
| 1.3.1 Informação e relações | ❌ rótulos não associados |
| 1.4.1 Uso de cor | ✅ estado sempre com texto |
| 1.4.3 Contraste mínimo | ❌ CTA a 3,12:1 |
| 1.4.4 Redimensionar texto | ⚠ nunca testado |
| 1.4.11 Contraste de não texto | ⚠ divisor a 1,32:1 |
| 2.1.1 Teclado | ⚠ controles nativos, mas foco invisível |
| 2.1.2 Sem armadilha de teclado | ⚠ modais sem captura — e sem saída definida |
| 2.4.3 Ordem de foco | ⚠ não verificada |
| 2.4.7 Foco visível | ❌ zero `:focus-visible` |
| 2.5.5 Tamanho do alvo | ❌ três controles abaixo de 44px |
| 3.2.2 Ao receber entrada | ✅ sem mudança inesperada de contexto |
| 3.3.1 Identificação de erro | ⚠ inconsistente |
| 3.3.2 Rótulos e instruções | ❌ rótulos não associados |
| 4.1.2 Nome, função, valor | ❌ zero `role=` |
| 4.1.3 Mensagens de estado | ❌ zero `aria-live` |
| 2.3.3 Animação por interação (AAA) | ⚠ ausente em `agendar.html` |

---

## 18. Definition of Done

Nenhuma tela é considerada pronta sem:

- [ ] Todo controle interativo é elemento nativo (`<button>`, `<a>`, `<input>`)
- [ ] Todo campo tem `<label for>` associado
- [ ] `:focus-visible` visível em tudo que recebe foco
- [ ] Nenhum alvo abaixo de 44×44px (contando área estendida)
- [ ] Contraste medido em toda combinação nova
- [ ] Estado comunicado por cor **e** texto
- [ ] Modal/folha com `role`, captura e restauração de foco, e `Esc`
- [ ] Mudança dinâmica anunciada por `aria-live`
- [ ] Erro junto ao campo, com `aria-describedby`
- [ ] Movimento reduzido respeitado no CSS **e** no JS
- [ ] Testado em 320, 390 e 430px
- [ ] Testado com teclado, do início ao fim, sem mouse
- [ ] Testado com leitor de tela em pelo menos um fluxo completo

---

## 19. Plano de correção por prioridade

### P0 — Críticos (impedem uso por teclado ou reprovam AA de forma direta)

| # | Problema | Correção | Escopo |
|---|---|---|---|
| 1 | Zero `:focus-visible`; dois `outline: none` sem substituto | Anel de foco global via `--focus-ring` | CSS base — 1 regra |
| 2 | Nenhum `<label for>` | Ligar `id`/`for` em todos os campos | 26 campos |
| 3 | Alvos de 18, 26 e 28px | Área estendida por pseudo-elemento | 3 controles |
| 4 | Modais e folhas sem `role`, captura ou restauração de foco | Padrão único de folha/diálogo | 1 utilitário JS |
| 5 | `agendar.html` sem movimento reduzido | Bloco `@media` + verificação em JS | 1 arquivo |
| 6 | Contraste do CTA a 3,12:1 | Fundo `--color-accent-700` | ✅ **aprovado em 03/08/2026** — ver [03 §6](03_DESIGN_SYSTEM.md) |
| 7 | Cabeçalho, barra inferior e botões flutuantes fora do canvas no desktop | Container único centralizado | shell |

### P1 — Importantes

| # | Problema | Correção |
|---|---|---|
| 8 | Zero `aria-live` | Anunciar busca, filtro e quantidade |
| 9 | Toast sem `role="status"` | Adicionar |
| 10 | `aria-label` esparso, sobretudo em `agendar.html` (1 ocorrência) | Cobrir todos os controles sem texto |
| 11 | Sem área segura | Somar `env(safe-area-inset-*)` |
| 12 | Sem `Skeleton`, `ErrorState`, `Banner` | Criar os componentes |
| 13 | Branco sobre caramelo a 3,64:1 | ✅ **resolvido** — sólidos em `accent-700`, avatar em `accent-100`/`accent-700` ([03 §6](03_DESIGN_SYSTEM.md)). Novo P9: avatar `sm` a 4,36:1, 3% abaixo do mínimo — exceção registrada ou trocar por `--color-text` |
| 14 | Erros inconsistentes, sem `aria-describedby` | Padronizar |

### P2 — Refinamentos

| # | Problema | Correção |
|---|---|---|
| 15 | Zoom de texto nunca testado | Testar a 200% e corrigir o que quebrar |
| 16 | Zoom automático de campo em iOS | Testar e decidir |
| 17 | Ordem de foco não verificada | Auditar tela a tela |
| 18 | Um único ponto de quebra | Revisar em 320–430px |
| 19 | 27 emojis usados como ícone | Substituir por `ICONS` |
| 20 | Divisor a 1,32:1 | Usar `--color-neutral-300` onde delimita controle |
| 21 | Nenhum teste com leitor de tela | Executar um fluxo completo |

**Ordem recomendada:** P0-1 e P0-3 são de baixo risco e alto impacto — devem
entrar no primeiro pull request de fundamentos ([08 §19](08_IMPLEMENTATION_RULES.md)).
P0-6 fica bloqueado até decisão do dono do produto.

---

**Próximo documento:** [08 — Implementation Rules](08_IMPLEMENTATION_RULES.md).
