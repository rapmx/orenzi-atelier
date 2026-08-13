# 04 — Component Library

**Versão 1.0 · 03/08/2026**

Biblioteca oficial. Um componente que não está aqui não existe.

**Como ler.** Cada entrada tem os mesmos campos. Onde um campo diz "padrão",
vale a regra geral da seção correspondente e não há exceção.

**Três níveis.** Primitivos dão a base visual e são rígidos. Componentes de
produto têm composição e comportamento próprios, mas **nunca tokens próprios**.
Padrões compostos organizam a tela.

> **Nada aqui está implementado.** Este documento define o alvo. O estado atual
> e a ordem de migração estão em [08](08_IMPLEMENTATION_RULES.md).

---

## Regras que valem para todos

1. **Nenhum componente declara valor visual literal.** Só tokens de
   [03](03_DESIGN_SYSTEM.md).
2. **Alvo de toque mínimo 44×44px.** Quando o desenho pede menor, estender a
   área com um pseudo-elemento invisível.
3. **Todo componente interativo tem foco visível**, via `--focus-ring`.
4. **Toda animação respeita movimento reduzido** ([05](05_MOTION_SYSTEM.md)).
5. **Estado nunca é comunicado só por cor** ([02 §7](02_DESIGN_PRINCIPLES.md)).
6. **Elemento com foco ou animação não sobrevive a um redesenho do container** —
   atualizar o nó diretamente.
7. **Prefixo de classe:** `.o-` para primitivos e padrões compostos. Componentes
   de produto mantêm nomes de domínio.

---

# Nível 1 — Primitivos

## Button

**Objetivo.** Executar a ação principal ou secundária de um contexto.
**Quando usar.** Ação que altera dados, navega para um fluxo, ou confirma.
**Quando não usar.** Navegação entre abas (é `BottomNavigation`), seleção
mutuamente exclusiva (é `Chip`), ação só de ícone (é `IconButton`).

**Anatomia.** `[ícone opcional] rótulo [contador opcional]` — altura 48px,
`--radius-full`, `--text-body-strong`, padding horizontal `--space-4`.

**Variantes.**

| Variante | Fundo | Texto | Borda | Uso |
|---|---|---|---|---|
| `primary` | **`--color-accent-700`** | `--color-bg` | — | uma por tela |
| `secondary` | `--color-surface` | `--color-text` | 1px `--color-divider` | ação de apoio |
| `ghost` | transparente | `--color-neutral-700` | — | terciária, cancelar |
| `destructive` | `--color-accent-2-100` | `--color-accent-2-700` | 1px `--color-accent-2` | excluir, cancelar atendimento |

✅ `primary` usa `--color-accent-700` desde 03/08/2026 — **5,02:1**, aprova AA.
`--color-accent` não é fundo de superfície com texto
([03 §6](03_DESIGN_SYSTEM.md#6-contraste-e-uso-correto)).

**Caixa (sentence case).** Rótulo com a primeira letra maiúscula e o resto
minúsculo: "Salvar cliente", "Novo agendamento". **Caixa alta é proibida em
botão** — permitida só em microbadge, data compacta, código e identificador
curto ([06 §11](06_CONTENT_GUIDELINES.md)).

**Estados.** `default` · `pressed` (escala 0,98, `--motion-instant`) ·
`focus-visible` (`--focus-ring`) · `disabled` (opacidade 0,4, sem cursor) ·
`loading` (rótulo trocado por indicador, largura preservada, botão inerte) ·
`error` (não se aplica — erro aparece no campo ou em `Toast`).

**Hierarquia.** Uma `primary` por tela. `destructive` nunca é `primary` e nunca
recebe foco inicial.

**Toque.** Pressão responde em ≤80ms. Largura total dentro de folhas e
formulários; largura de conteúdo em linha.

**Acessibilidade.** `<button>` nativo. Rótulo nomeia a ação
([06 §11](06_CONTENT_GUIDELINES.md)). `disabled` real, não simulado com CSS.
`loading` anuncia via `aria-busy`.

**Responsividade.** Largura total abaixo de 480px em contextos de formulário.
Nunca reduz altura abaixo de 44px.

**Tokens.** `--radius-full`, `--text-body-strong`, `--space-4`, cores da §4 de
[03](03_DESIGN_SYSTEM.md), `--motion-instant`.

**Erros comuns.** Duas `primary` na mesma tela. Rótulo genérico ("Confirmar",
"OK"). Desabilitar sem dizer por quê. Sombra em botão que não flutua.

**Deve convergir para ele.**
- `.btn` / `.btn-primary` / `.btn-ghost` do painel (padding 14px, 15px, fundo
  `--color-accent`, sem caixa alta).
- `.btn` / `.btn-primary` / `.btn-ghost-link` de `agendar.html` (padding 15px,
  13px, **caixa alta com espaçamento de letra**, fundo `--color-accent-700`).

⚠ **São duas identidades sob o mesmo nome de classe.**
✅ **Resolvido em 03/08/2026: a caixa alta sai.** O padrão é sentence case, e o
espaçamento de letra de `agendar.html` sai junto. Era o único lugar do produto
que usava caixa alta e prejudicava a legibilidade de rótulos longos.

---

## IconButton

**Objetivo.** Ação sem rótulo, quando o ícone é inequívoco e o espaço é escasso.
**Quando usar.** Fechar, voltar, limpar busca, excluir foto, navegar mês.
**Quando não usar.** Ação destrutiva importante, ação rara, ícone ambíguo.

**Anatomia.** Container quadrado ou circular, ícone centralizado 17–21px.

**Variantes.** `plain` (só ícone) · `outlined` (borda `--color-divider`) ·
`filled` (fundo `--color-accent-100`) · `squircle` (`--radius-sm`, para ações de
cabeçalho).

**Estados.** `default` · `pressed` (escala 0,9) · `focus-visible` · `disabled` ·
`loading` (indicador no lugar do ícone).

**Hierarquia.** Nunca é a ação primária de uma tela — exceto o `FAB`, que é um
padrão à parte.

**Toque.** **44×44px obrigatórios**, mesmo quando o desenho aparenta menos.

**Acessibilidade.** `aria-label` obrigatório, sempre. Ícone é decorativo para o
leitor de tela.

**Responsividade.** Tamanho fixo. Não encolhe.

**Tokens.** `--radius-circle` / `--radius-sm`, `--color-divider`,
`--color-accent-100`, `--motion-instant`.

**Erros comuns.** Alvo pequeno demais. Falta de `aria-label`. Usar para ação que
precisa de rótulo.

**Deve convergir para ele.** As setas do seletor de mês (**28px**), o botão de
excluir foto (**26px**), o botão de ajuda dos indicadores (**18px**), o limpar
da busca, o `+` da agenda (42px, squircle — mantém a aparência, ganha área).
**Os três primeiros violam o mínimo de 44px hoje** — P0 em
[07](07_ACCESSIBILITY.md).

---

## Input

**Objetivo.** Entrada de texto de uma linha.
**Quando usar.** Nome, telefone, e-mail, valor, quantidade digitada.
**Quando não usar.** Busca (é `SearchField`), texto longo (é `Textarea`),
escolha entre opções conhecidas (é `Select` ou `Chip`).

**Anatomia.** Rótulo acima → campo → texto de apoio ou de erro abaixo.
Campo com fundo `--color-surface`, borda 1px, `--radius-sm`, altura mínima 44px.

**Variantes.** `text` · `tel` · `email` · `number` · `currency` · `date`.
Usar o tipo nativo correto — muda o teclado do celular.

**Estados.** `default` · `focused` (borda `--color-accent-600` + `--focus-ring`)
· `filled` · `disabled` · `readonly` · `error` (borda `--color-accent-2` +
mensagem abaixo) · `loading` (raro; campo inerte).

**Hierarquia.** Rótulo sempre visível. **Placeholder nunca substitui rótulo.**

**Toque.** Toque em qualquer ponto do campo — incluindo o rótulo — foca.

**Acessibilidade.** `<label for>` ligado ao `id` do campo, obrigatório. Erro
ligado por `aria-describedby` e anunciado. `aria-invalid` no estado de erro.

⚠ **Não existe um único `for=` no projeto hoje.** Os 20 rótulos do painel e os
6 de `agendar.html` são texto solto. **P0.**

**Responsividade.** Largura total. Tamanho de fonte ≥16px em iOS evita o zoom
automático ao focar. ⚠ **PENDENTE:** o corpo do produto é 15px — verificar se o
zoom ocorre e decidir entre 16px nos campos ou `maximum-scale`. Não decidir sem
teste.

**Tokens.** `--radius-sm`, `--color-surface`, `--color-divider`,
`--color-accent-600`, `--focus-ring`, `--text-body`, `--space-3`.

**Erros comuns.** Rótulo como placeholder. `outline: none` sem substituto. Erro
em alerta no topo em vez de junto ao campo. Tipo de teclado errado.

**Deve convergir para ele.** Todos os campos do modal de novo agendamento, do
cadastro de produto e do perfil da cliente. `.modal-field-label` (criado só para
um modal) vira o rótulo padrão do componente.

---

## Textarea

**Objetivo.** Texto livre de várias linhas.
**Quando usar.** Observações, fórmula da cliente, anotação de atendimento.
**Quando não usar.** Qualquer coisa que caiba em uma linha.

**Anatomia.** Igual ao `Input`, com altura mínima de 3 linhas e crescimento
automático até um teto (então rola internamente).

**Variantes.** `default` · `com contador` (quando há limite real de caracteres).

**Estados.** Iguais aos do `Input`.

**Hierarquia · Toque · Acessibilidade · Responsividade · Tokens.** Iguais ao
`Input`. Redimensionamento manual desabilitado no celular.

**Erros comuns.** Altura fixa pequena que obriga rolagem interna desde a
primeira linha. Contador sem limite real.

**Deve convergir para ele.** Campos de observação do painel.

---

## Select

**Objetivo.** Escolha única entre opções conhecidas.
**Quando usar.** 4 ou mais opções, ou lista que vem do banco (serviço,
profissional, horário).
**Quando não usar.** **3 opções ou menos** — usar `Chip` ou controle direto
([02 §4](02_DESIGN_PRINCIPLES.md)). Escolha com muitas opções e busca — usar
`BottomSheet` com `SearchField`.

**Anatomia.** Mesma caixa do `Input`, com chevron à direita.

**Variantes.** `native` (padrão — usa o seletor do sistema, melhor no celular) ·
`sheet` (abre `BottomSheet` quando é preciso mostrar detalhe por opção).

**Estados.** `default` · `focused` · `disabled` **com motivo visível** ·
`error` · `loading` (opções sendo carregadas — campo inerte com aviso).

**Hierarquia.** Quando depende de outros campos, permanece desabilitado com uma
frase explicando o que falta — nunca vazio e mudo.

**Toque.** Altura mínima 44px. Toque em qualquer ponto abre.

**Acessibilidade.** `<select>` nativo com `<label for>`. A variante `sheet` segue
as regras de `BottomSheet`.

**Responsividade.** Largura total.

**Tokens.** Iguais ao `Input`.

**Erros comuns.** Campo de horário como texto livre. Desabilitar sem explicar.
Lista fixa onde os dados reais divergem.

**Deve convergir para ele.** Os `<select>` do modal de novo agendamento
(serviço, profissional, horário) e do cadastro de produto. O campo de horário
**já foi migrado** de texto livre para lista de horários livres — manter.

---

## SearchField

**Objetivo.** Filtrar uma lista pelo que a pessoa digita.
**Quando usar.** Listas com mais de 20 itens esperados
([09](09_UX_PATTERNS.md)).
**Quando não usar.** Listas curtas; busca global (não existe no produto).

**Anatomia.** `[ícone de lupa] [campo] [limpar quando há texto]` — altura 44px,
`--radius-full`, fundo `--color-surface`, borda 1px.

**Variantes.** `default` · `com filtros` (chips logo abaixo, mesma faixa).

**Estados.** `default` · `focused` (borda `--color-accent-600` +
`--focus-ring`; o placeholder some) · `filled` (botão de limpar aparece) ·
`empty results` (a lista mostra `EmptyState` de "sem resultados", **não** o
convite de primeira vez).

**Hierarquia.** Fica abaixo do resumo operacional e acima da lista. Nunca no
cabeçalho fixo.

**Toque.** Botão de limpar com 44px de área. **Deve responder a `mousedown`, não
a `click`** — o `blur` do campo dispara primeiro e o botão já teria desaparecido.

**Acessibilidade.** `<input type="search">` com rótulo associado (pode ser
visualmente oculto). ⚠ **Hoje o estado de foco depende de uma classe aplicada
por JS e o `outline` nativo é removido.** O anel de foco precisa existir também
sem JS. **P0.**

**Responsividade.** Largura total.

**Tokens.** `--radius-full`, `--color-surface`, `--color-divider`,
`--color-accent-600`, `--focus-ring`, `--text-body`.

**Erros comuns.** Redesenhar a lista inteira a cada tecla — o campo é recriado,
perde o foco e o cursor volta ao começo. **Atualizar só o container da lista.**

**Deve convergir para ele.** `.search-field` de Clientes e de Estoque — já é
compartilhado, precisa apenas de foco nativo e rótulo.

---

## Chip

**Objetivo.** Seleção rápida, filtro ou marcação em linha.
**Quando usar.** Filtro de lista, categoria, escolha entre 2–6 opções curtas.
**Quando não usar.** Ação (é `Button`). Informação não clicável (é `Badge`).

**Anatomia.** Pílula com padding `8px 14px`, `--radius-full`,
`--text-caption`, ícone opcional à esquerda.

**Variantes.**

| Variante | Comportamento |
|---|---|
| `filter` | seleção única dentro de uma faixa horizontal rolável |
| `choice` | seleção única solta; **tocar no valor ativo desmarca** |
| `category` | filtro nascido dos dados reais, com ícone por categoria |

**Estados.** `default` (fundo `--color-surface`, borda `--color-divider`) ·
`active` (fundo `--color-accent-100`, texto `--color-accent-700`, borda
`--color-accent-600`) · `pressed` (escala 0,96) · `focus-visible` · `disabled`.

**Hierarquia.** Chips não competem com a ação primária. A faixa rola
horizontalmente sem barra visível e sem quebrar linha.

**Toque.** Altura mínima 44px de área, ainda que o desenho tenha 34px.

**Acessibilidade.** `<button>` com `aria-pressed`. Faixa navegável por teclado.

**Responsividade.** Rolagem horizontal; nunca quebra em várias linhas.

**Tokens.** `--radius-full`, `--space-2`/`--space-3-5`, `--text-caption`,
família accent.

**Erros comuns.** Lista de categorias fixa no código quando as reais vêm do
banco — vira filtro que nunca encontra nada. Redesenhar a lista inteira ao
alternar um chip, o que reinicia animações de entrada.

**Deve convergir para ele.** `.filter-chip` (filtros de cliente e estoque),
`.hair-chip` (diagnóstico do cabelo, `choice`), e o segmentado de Insights.
⚠ São **três implementações** de padding e comportamento quase iguais.

---

## Badge

**Objetivo.** Rótulo de estado ou classificação, **não clicável**.
**Quando usar.** Estado do atendimento, estado do estoque, tag VIP, contador.
**Quando não usar.** Se é clicável, é `Chip`.

**Anatomia.** Pílula pequena: `--radius-full`, padding `3px 8px`,
`--text-micro` (11/700).

**Variantes.** `neutral` · `success` · `attention` · `critical` · `count`.
Cada uma usa o par tingido/texto da §5 de [03](03_DESIGN_SYSTEM.md).

**Estados.** Estático. Sem pressionado, foco ou desabilitado.

**Hierarquia.** No máximo um badge de estado por item de lista.

**Toque.** Não é alvo de toque.

**Acessibilidade.** Texto real, nunca só cor. Não é `<button>`.

**Responsividade.** Não encolhe; o texto ao lado é que trunca.

**Tokens.** `--radius-full`, `--text-micro`, pares de estado.

**Erros comuns.** Badge clicável. Contador que não muda comportamento nenhum.
Vermelho em coisa que não é urgente.

**Deve convergir para ele.** `.badge`, as classes `.tag-*` e os badges de estado
do estoque.
⚠ **Armadilha registrada:** `.tag-accent-2` declara valores de recuo **verdes**
(`#f0fae1` / `#56633f`) para variáveis vermelhas. Nunca aparece porque as
variáveis existem — mas copiar essa linha para outro arquivo pinta o alerta de
verde. Remover na migração.

---

## Avatar

**Objetivo.** Identificar uma pessoa.
**Quando usar.** Lista de clientes, cabeçalho de perfil, item de agendamento.
**Quando não usar.** Produto ou serviço — usar ícone de categoria.

**Anatomia.** Círculo com foto ou iniciais. Selo opcional sobreposto no canto.

**Variantes.** `sm` 40px (lista) · `lg` 72px (perfil). Com foto ou com iniciais
(**`--color-accent-700` sobre `--color-accent-100`**, decisão de 03/08/2026).

**Estados.** `default` · `pressed` quando dentro de um alvo tocável ·
`loading` (Skeleton circular) · `sem foto` (iniciais).

**Hierarquia.** O selo (VIP) usa `--color-accent-700`. **Nunca**
`--color-accent-2`.

**Toque.** Não é alvo próprio — herda do cartão que o contém.

**Acessibilidade.** Foto com `alt` = nome da pessoa. Iniciais são decorativas se
o nome está ao lado.
⚠ No avatar `sm` (40px, iniciais em 13px), `--color-accent-700` sobre
`--color-accent-100` mede **4,36:1** — 3% abaixo do mínimo de texto pequeno
(4,5:1). No avatar `lg` (72px), a fonte maior cai no limiar de 3:1 e a
combinação passa. **P9 em [03 §21](03_DESIGN_SYSTEM.md).**
⚠ O círculo `accent-100` mede **1,15:1** contra o fundo — quase não se distingue
como forma. **P10 em [03 §21](03_DESIGN_SYSTEM.md)**, com borda de 1px em
`--color-divider` como proposta.

**Responsividade.** Tamanho fixo por variante.

**Tokens.** `--radius-circle`, `--color-accent-100`, `--color-accent-700`.

**Erros comuns.** Tamanho fora das duas variantes. Selo em cor de alerta.

**Deve convergir para ele.** `.avatar` (40px) e o avatar do perfil (72px) com o
selo `.ph-vip-badge`.

---

## Divider

**Objetivo.** Separar itens quando espaço e tipografia não bastaram.
**Quando usar.** Linhas de uma mesma lista dentro de uma superfície.
**Quando não usar.** Entre seções — ali o separador é espaço
([02 §3](02_DESIGN_PRINCIPLES.md)).

**Anatomia.** Linha de 1px em `--color-divider`, largura total ou recuada até o
início do texto.

**Variantes.** `full` · `inset`.
**Estados.** Nenhum.
**Hierarquia.** O recurso de separação mais fraco depois do espaço.
**Toque.** Não aplicável.
**Acessibilidade.** Decorativo — nunca `<hr>` semântico entre itens de lista.
**Responsividade.** Acompanha a largura do container.
**Tokens.** `--color-divider`, `--border-width`.
**Erros comuns.** Divisor + espaço grande + borda de card ao mesmo tempo.
**Deve convergir para ele.** As linhas do detalhe de atendimento e do resumo de
confirmação de agendamento.

---

## Card

**Objetivo.** Agrupar conteúdo relacionado em uma superfície própria.
**Quando usar.** Bloco tocável, bloco com estado próprio, bloco que flutua.
**Quando não usar.** Como recurso padrão de organização — ver
[02 §1](02_DESIGN_PRINCIPLES.md). **Nunca card dentro de card.**

**Anatomia.** Fundo `--color-surface` + borda 1px `--color-divider` +
`--radius-md` (16px) + padding `--space-3` a `--space-4`.
Este é o **modelo canônico**, extraído do card de agendamento da home.

**Variantes.**

| Variante | Diferença |
|---|---|
| `default` | o modelo acima |
| `interactive` | resposta ao toque: escala 0,98 + `--elevation-hover` |
| `stateful` | borda e fundo tingidos pela cor do estado |
| `large` | `--radius-lg`, padding `--space-5` — blocos de destaque |

**Estados.** `default` · `pressed` (só `interactive`) · `focus-visible` ·
`loading` (Skeleton com a mesma geometria) · `disabled` (opacidade 0,5, sem
resposta ao toque).

**Hierarquia.** Um assunto por card. Um nível de aninhamento, no máximo.

**Toque.** `interactive` é um `<button>` de largura total.

**Acessibilidade.** Card clicável é `<button>` ou `<a>`, nunca `<div>` com
manipulador. Um único alvo por card — evitar botões aninhados.

**Responsividade.** Largura total dentro do gutter de 20px.

**Tokens.** `--color-surface`, `--color-divider`, `--radius-md`/`--radius-lg`,
`--space-3`/`--space-4`, `--elevation-hover`.

**Erros comuns.** Card dentro de card. Sombra estática. Raio fora da escala.

**Deve convergir para ele.** ⚠ **Quatro raios para o mesmo papel visual:**

| Raio | Classes atuais |
|---|---|
| **16px** (canônico) | card de agendamento, `.list-row`, `.client-card`, `.product-card`, `.stk-sum-card`, `.stat-row`, `.modal-section`, `.suggestion-card`, `.stock-value-card` |
| 18px | `.insight-card` |
| 22px | `.perf-card`, `.panorama-card`, `.history-card`, `.home-hero-card` |
| 14px | `.action-row` |

✅ Convergência aprovada em 03/08/2026: 18→16, 22→20, 14→12 — ver
[03 §11](03_DESIGN_SYSTEM.md). Migração gradual, componente por componente, sem
substituição global.

⚠ `.card` e `.action-row` usam `--color-neutral-100` de fundo em vez de
`--color-surface`. Mesma cor hoje, nomes diferentes — migrar para
`--color-surface`.

---

## Skeleton

**Objetivo.** Ocupar o lugar do conteúdo enquanto ele carrega.
**Quando usar.** Lista, cartão ou métrica cuja geometria é conhecida de
antemão.
**Quando não usar.** Ação pontual (usar `loading` do próprio botão). Espera de
duração desconhecida e longa.

**Anatomia.** Blocos com **a geometria real do conteúdo** — mesma altura, mesmo
raio, mesmo número de linhas.

**Variantes.** `text` (linha, `--radius-sm`) · `circle` (avatar) ·
`card` (cartão inteiro) · `metric` (bloco de número).

**Estados.** Pulsação sutil de opacidade, ~1,2s. **Sem pulsação** com movimento
reduzido — fica estático.

**Hierarquia.** Substitui o conteúdo no lugar exato. Nunca aparece junto com
ele.

**Toque.** Inerte.

**Acessibilidade.** Container com `aria-busy="true"`. Não anunciar cada bloco.

**Responsividade.** Acompanha a geometria do que substitui.

**Tokens.** `--color-neutral-200`, `--radius-sm`/`--radius-md`.

**Erros comuns.** Skeleton com geometria diferente do conteúdo — a tela "pula"
quando carrega. Skeleton para espera de menos de 200ms.

**Deve convergir para ele.** ⚠ **Não existe nenhum skeleton no projeto.**
Componente novo. **P1.**

---

## Spinner

**Objetivo.** Indicar espera sem geometria conhecida.
**Quando usar.** Dentro de um botão em `loading`, ou espera curta em um alvo
pequeno.
**Quando não usar.** Carregamento de lista ou tela — ali é `Skeleton`.
**Nunca em tela cheia.**

**Anatomia.** Arco circular de 16–20px, traço 2px, `currentColor`.
**Variantes.** `inline` (dentro de botão) · `standalone` (raro).
**Estados.** Rotação contínua. **Com movimento reduzido:** substituir por
pulsação de opacidade — rotação contínua é exatamente o que a preferência pede
para evitar.
**Hierarquia.** Nunca o elemento mais visível da tela.
**Toque.** Inerte.
**Acessibilidade.** `role="status"` com texto oculto ("Carregando").
**Responsividade.** Tamanho fixo.
**Tokens.** `currentColor`, `--motion-*`.
**Erros comuns.** Spinner cobrindo a tela. Spinner onde caberia skeleton.
**Deve convergir para ele.** Não existe hoje. Componente novo.

---

# Nível 2 — Componentes de produto

Compostos a partir dos primitivos. Podem ter composição e comportamento
próprios; **não podem** ter tokens próprios.

## ClientCard

**Objetivo.** Representar uma cliente em lista, com o essencial para decidir se
é ela.
**Usar em** lista de clientes. **Não usar** para escolher cliente dentro de um
formulário — ali é uma linha simples de seleção.

**Anatomia.** `Avatar sm` → nome (`--text-body-strong`) + `StatusIndicator` →
última visita, número de visitas, total investido → chevron.

**Variantes.** `default` · `vip` (selo no avatar).
**Estados.** `default` · `pressed` · `focus-visible` · `loading` (Skeleton card).
**Hierarquia.** Nome é o elemento dominante. Métricas em `--text-caption`.
**Toque.** Card inteiro é um `<button>`. Altura mínima 44px.
**Acessibilidade.** Rótulo do botão inclui nome e estado.
**Responsividade.** Métricas colapsam para duas linhas abaixo de 360px.
**Tokens.** `Card interactive` + `--text-*` + cores de estado.
**Erros comuns.** Mostrar dado que não ajuda a identificar a pessoa.
**Converge:** `.client-card` / `.client-list-card`.

## AppointmentCard

**Objetivo.** Um atendimento fora da grade da agenda (home, próximos horários).
**Usar em** Início e listas de atendimento. **Não usar** dentro da timeline —
ali é `TimelineItem`.

**Anatomia.** Faixa de cor da categoria → horário → cliente → serviço →
`Badge` de estado.
**Variantes.** `próximo` · `concluído` · `cancelado`.
**Estados.** `default` · `pressed` · `focus-visible` · `loading`.
**Hierarquia.** Horário e nome da cliente dominam.
**Toque.** Card inteiro tocável.
**Acessibilidade.** A cor de categoria é auxiliar — o nome do serviço está
sempre em texto.
**Responsividade.** Serviço trunca antes do nome da cliente.
**Tokens.** `Card interactive`, `CATEGORY_COLORS`, `Badge`.
**Erros comuns.** Usar `--color-accent-2` na paleta de categorias.
**Converge:** o card de agendamento da home — **é o modelo canônico de `Card`**,
preservar.

## StockCard

**Objetivo.** Um produto com seu estado e controle de quantidade.
**Usar em** lista de estoque. **Não usar** em seleção de produto.

**Anatomia.** Ícone de categoria → nome + marca → `Badge` de estado →
`QuantityControl`.
**Variantes.** Uma por estado: `ok`, `baixo`, `crítico`, `sem`.
**Estados.** `default` · `pressed` · `focus-visible` · `loading` ·
`saving` (durante a gravação da quantidade).
**Hierarquia.** Produto em estado crítico vem primeiro na lista.
**Toque.** Corpo abre o detalhe; `QuantityControl` é alvo independente.
**Acessibilidade.** Estado em texto no badge, não só na cor da borda.
**Responsividade.** Nome trunca; o controle de quantidade nunca encolhe.
**Tokens.** `Card stateful` — cada estado declara só cor e fundo.
**Erros comuns.** Redesenhar a lista durante o gesto no `−`/`+`, destruindo o
botão sob o dedo.
**Converge:** `.product-card` — implementação de estado já correta, é o modelo.

## InsightCard

**Objetivo.** Um gráfico que responde **uma** pergunta.
**Usar em** Insights. **Não usar** para número isolado — é `MetricCard`.

**Anatomia.** Título (a pergunta) → gráfico → legenda → ajuda opcional.
**Variantes.** Por tipo de gráfico.
**Estados.** `default` · `loading` (Skeleton com a altura do gráfico) ·
`empty` (sem dado suficiente — texto explícito, nunca gráfico vazio) · `error`.
**Hierarquia.** Um gráfico por card, sempre.
**Toque.** Não tocável, exceto o botão de ajuda.
**Acessibilidade.** Resumo textual do que o gráfico mostra. Séries distinguíveis
sem depender só de cor.
**Responsividade.** Altura fixa; o gráfico se ajusta em largura.
**Tokens.** `Card` (raio 18px hoje → 16px, pendente P2).
**Erros comuns.** Dois assuntos no mesmo card. Gráfico sem dado suficiente.
**Converge:** `.insight-card`, `.perf-card`, `.panorama-card`.

## MetricCard

**Objetivo.** Um número com rótulo e, opcionalmente, comparação.
**Usar em** resumo de estoque, métricas do perfil, KPIs da home.
**Não usar** quando o número exige um gráfico para significar algo.

**Anatomia.** Ícone opcional acima → número (`--text-display`) → rótulo
(`--text-caption`) → variação opcional com seta e cor.
**Variantes.** `plain` · `com variação` · `tocável` (abre um detalhe filtrado).
**Estados.** `default` · `pressed` (só tocável) · `focus-visible` · `loading` ·
`empty` (traço em vez de número, com legenda "sem dados").
**Hierarquia.** O número é o maior elemento do bloco.
**Toque.** 44px quando tocável.
**Acessibilidade.** Rótulo lido junto ao número. Seta de variação acompanhada de
sinal em texto.
**Responsividade.** Grade de 4 colapsa para 2 abaixo de 360px.
**Tokens.** `Card`, `--text-display`, `--text-caption`, cores de estado.
**Erros comuns.** Número sem rótulo. Variação sem período de comparação.
**Converge:** `.stk-sum-card`, `.stock-value-card`, `.stat-row`, os KPIs da home.

## HistoryItem

**Objetivo.** Um evento passado em uma lista cronológica.
**Usar em** histórico de visitas e movimentações de estoque.
**Não usar** para eventos futuros — são `AppointmentCard`.

**Anatomia.** Data empilhada (dia / mês / ano) → ícone do tipo de evento →
descrição → valor ou quantidade.
**Variantes.** `visita` · `movimentação` (entrada / saída / ajuste).
**Estados.** `default` · `pressed` quando abre detalhe · `loading`.
**Hierarquia.** Mais recente primeiro. Preview de 3, resto atrás de "Ver mais".
**Toque.** Tocável só quando existe detalhe.
**Acessibilidade.** Data em formato legível por leitor de tela, não só abreviada.
**Responsividade.** Descrição trunca; data e valor não.
**Tokens.** `Card` ou `TimelineItem`, `--text-caption`.
**Erros comuns.** Somar tipos de movimentação diferentes ao calcular consumo —
só saída é consumo.
**Converge:** `.history-row` e as linhas de movimentação do estoque.

## ServiceTag

**Objetivo.** Identificar um serviço pela categoria.
**Usar em** cards de atendimento, favoritos da cliente.
**Não usar** como filtro clicável — ali é `Chip`.
**Anatomia.** Ponto ou faixa da cor da categoria + nome do serviço.
**Variantes.** `inline` (ponto + texto) · `faixa` (barra lateral em card).
**Estados.** Estático.
**Hierarquia.** Secundário ao nome da cliente.
**Toque.** Não tocável.
**Acessibilidade.** Nome sempre presente; cor é auxiliar.
**Responsividade.** Trunca.
**Tokens.** `CATEGORY_COLORS`, `--text-caption`.
**Erros comuns.** Cor sem texto. Uso de `--color-accent-2`.
**Converge:** as faixas de categoria dos cards de atendimento.

## StatusIndicator

**Objetivo.** Comunicar o estado de uma entidade em um olhar.
**Usar em** cliente, produto, atendimento, ocupação.
**Não usar** quando o estado já está óbvio pelo contexto.

**Anatomia.** **Ponto colorido + rótulo em texto, sempre juntos.**
**Variantes.** `dot` (em linha) · `badge` (destacado) · `bar` (ocupação).
**Estados.** Um por estado do domínio.
**Hierarquia.** Nunca compete com o nome da entidade.
**Toque.** Não tocável.
**Acessibilidade.** **Cor nunca sozinha** — regra fundadora do componente.
**Responsividade.** O rótulo pode abreviar, nunca sumir.
**Tokens.** Pares de estado da §5 de [03](03_DESIGN_SYSTEM.md).
**Erros comuns.** Ponto sem rótulo, com legenda em outro lugar da tela.
**Converge:** o ponto de estado da cliente e o do estoque — **implementação já
correta, é o modelo.**

## QuantityControl

**Objetivo.** Ajustar uma quantidade inteira sem sair da lista.
**Usar em** estoque. **Não usar** para valores com casas decimais ou moeda.

**Anatomia.** `[−] [número tocável] [+]`, botões de 38px com área estendida
para 46px.
**Variantes.** `inline` (no card) · `expanded` (na folha de edição).
**Estados.** `default` · `pressed` (escala 0,9) · `holding` (acumulando) ·
`disabled` (em 0, o `−` desabilita) · `saving`.
**Hierarquia.** Alvo independente dentro do card.
**Toque.** **Segurar acumula na tela e grava uma vez só ao soltar** — uma
escrita, um registro no histórico. Os passos alteram o texto do número
diretamente, sem redesenhar a lista. **Toque simples** no número abre a edição
manual — duplo toque disputa com o zoom do navegador e falha metade das vezes.
**Acessibilidade.** `aria-label` em cada botão incluindo o nome do produto.
Valor anunciado ao mudar, via `aria-live="polite"`.
**Responsividade.** Tamanho fixo; nunca encolhe.
**Tokens.** `IconButton outlined`, `--color-accent-100`.
**Erros comuns.** Gravar a cada passo. Redesenhar durante o gesto.
**Converge:** `.qty-btn` / `.qty-num` — **implementação já correta**, falta só o
anúncio para leitor de tela.

## DateSelector

**Objetivo.** Escolher um dia.
**Usar em** agenda (faixa de dias) e agendamento (calendário do mês).
**Não usar** para intervalo de datas — não existe no produto.

**Anatomia.** Faixa: 7 botões de dia com sigla e número. Calendário: grade
mensal com navegação.
**Variantes.** `week-strip` · `month-grid`.
**Estados.** `default` · `selected` (fundo e borda em accent) · `today`
(marcador discreto) · `disabled` (dia fechado ou passado) · `pressed` ·
`focus-visible`.
**Hierarquia.** O dia selecionado é o elemento mais forte da faixa.
**Toque.** 44px por dia.
**Acessibilidade.** Navegação por teclado entre dias. Dia selecionado com
`aria-current="date"`. Dia indisponível anuncia o motivo.
**Responsividade.** Sete colunas iguais em qualquer largura.
**Tokens.** `--radius-sm`, família accent, `--motion-fast`.
**Erros comuns.** ⚠ **Armadilha registrada:** os manipuladores dos botões de dia
são amarrados só no desenho completo. No caminho leve (troca de dia dentro da
mesma semana) eles não são reamarrados — **não podem** usar a data capturada no
escopo de criação; têm de ler o estado atual no momento do toque. Sem isso, o
segundo toque em sequência vira nada, em silêncio.
**Converge:** `.week-day` e a grade do calendário mensal.

## TimelineItem

**Objetivo.** Um atendimento posicionado na grade de horário.
**Usar em** agenda. **Não usar** fora da timeline.

**Anatomia.** Bloco posicionado por horário e duração, com cor de categoria,
horário, cliente e serviço. **Modelo de segmentos:** trabalho inicial → pausa
(faixa listrada, profissional livre) → finalização.
**Variantes.** `simples` · `com pausa` · `encaixe` (recuado à esquerda, empilhado
por nível).
**Estados.** `default` · `pressed` · `focus-visible` · `conflito`.
**Hierarquia.** Encaixes entram por cima, recuados — não em colunas, que
espremeriam os dois e esconderiam a pausa.
**Toque.** Bloco inteiro tocável, mínimo 44px de altura efetiva.
**Acessibilidade.** Rótulo com horário, cliente e serviço. Não depender da
posição visual.
**Responsividade.** Largura do bloco em porcentagem do container.
**Tokens.** `CATEGORY_COLORS`, `--radius-sm`, `--text-caption`.
**Erros comuns.** Tratar sobreposição de pausa como conflito. **Conflito existe
só quando um bloco de trabalho encosta em outro.**
**Converge:** `.timeline-appt` — implementação já correta.

## CurrentTimeIndicator

**Objetivo.** Mostrar o instante atual na grade da agenda.
**Usar em** agenda, **apenas** quando o dia visível é hoje e a hora está dentro
da janela desenhada.
**Não usar** em outro dia.

**Anatomia.** Linha horizontal em cor de marca + selo com a hora.
**Variantes.** Única.
**Estados.** `default` · `highlight` (pulso ao tocar "Hoje").
**Hierarquia.** Visível, nunca dominante. **Cor de marca, nunca vermelho** —
vermelho é alerta.
**Toque.** Não tocável.
**Acessibilidade.** Decorativa; a hora já está na grade.
**Responsividade.** Largura total da grade.
**Tokens.** `--color-accent`, `--text-micro`, `tabular-nums`.
**Erros comuns.** ⚠ **Bug já corrigido, não reintroduzir:** posicionar pela
borda superior da caixa desalinha o centro visual em ~9,6px, porque a caixa
cresce para baixo a partir do ponto. A caixa precisa ser centralizada no ponto
com deslocamento de metade da própria altura. Reposiciona a cada 30s **sem**
redesenhar a agenda.
**Converge:** `.current-time-line` — implementação já correta.

---

# Nível 3 — Padrões compostos

## ScreenHeader

**Objetivo.** Situar a pessoa e dar acesso à ação de contexto.
**Usar em** todo destino de primeiro nível. **Não usar** em folha ou modal.
**Anatomia.** Título (ou saudação) + subtítulo opcional → ação de contexto à
direita.
**Variantes.** `home` (saudação + marca) · `section` (título) · `detail`
(voltar + título).
**Estados.** `default` · `loading` (Skeleton no subtítulo).
**Hierarquia.** O título é o maior elemento da tela até o conteúdo começar.
**Toque.** O botão de voltar tem 44px.
**Acessibilidade.** `<header>` com `<h1>`. Voltar com `aria-label`.
**Responsividade.** ⚠ **Deve respeitar o canvas de 480px centralizado.** Hoje
não respeita — P0 ([03 §17](03_DESIGN_SYSTEM.md)).
**Tokens.** `--space-6`, `--space-5`, `--text-title-1`.
**Erros comuns.** Cabeçalho fixo que come altura útil. Mais de uma ação.
**Converge:** o `header` do painel.

## SearchFilterBar

**Objetivo.** Reduzir uma lista longa.
**Usar em** listas com mais de 20 itens. **Não usar** em listas curtas.
**Anatomia.** `SearchField` → faixa de `Chip` → botão de ordenação à direita.
**Variantes.** `busca` · `busca + filtros` · `busca + filtros + ordenação`,
conforme os limiares de [09](09_UX_PATTERNS.md).
**Estados.** `default` · `filtrado` (chip ativo visível) · `sem resultados`.
**Hierarquia.** Abaixo do resumo, acima da lista. Não fixa no topo.
**Toque.** Faixa rolável horizontalmente.
**Acessibilidade.** Mudança de resultado anunciada por `aria-live="polite"`.
**Responsividade.** Chips rolam; a busca ocupa a largura total.
**Tokens.** `SearchField`, `Chip`, `IconButton`.
**Erros comuns.** Passar por um redesenho completo a cada tecla ou a cada chip —
perde foco e reinicia animações.
**Converge:** as barras de Clientes e de Estoque.

## MetricSummary

**Objetivo.** Responder "como está isso?" antes de a pessoa rolar.
**Usar em** topo de tela operacional, quando existe um número que muda decisão.
**Não usar** por padrão — só quando há uma pergunta real a responder.
**Anatomia.** Grade de 2 ou 4 `MetricCard`, opcionalmente com um valor de
destaque abaixo.
**Variantes.** `2 colunas` · `4 colunas` · `destaque`.
**Estados.** `default` · `loading` (Skeleton na geometria) · `empty`.
**Hierarquia.** O primeiro card é o número mais importante.
**Toque.** Cards podem abrir a lista já filtrada por aquele estado.
**Acessibilidade.** Cada card é um rótulo + valor associados.
**Responsividade.** 4 → 2 colunas abaixo de 360px.
**Tokens.** `MetricCard`, `--space-2`.
**Erros comuns.** Mais de 4 métricas. Métrica que ninguém usa.
**Converge:** o resumo de 4 cards do Estoque, os KPIs da home.

## BottomNavigation

**Objetivo.** Alternar entre os destinos de primeiro nível.
**Usar em** destinos de primeiro nível. **Não usar** em telas de detalhe,
folhas ou modais.
**Anatomia.** Barra fixa inferior com ícone empilhado sobre rótulo.
Hoje: Início · Insights · Agenda · Clientes · Estoque · Questionário.
**Variantes.** Única.
**Estados.** `default` · `active` (`--color-accent-700`, peso 700) · `pressed` ·
`focus-visible`.
**Hierarquia.** Sempre visível nos destinos principais. Some no detalhe.
**Toque.** 44px de altura efetiva por aba. Tocar na aba atual zera o contexto —
é entrada nova, não "voltar".
**Acessibilidade.** `<nav>` com `aria-current="page"` na aba ativa. Ícone
decorativo; o rótulo é o nome acessível.
**Responsividade.** ⚠ **Hoje atravessa a janela inteira no desktop.** Deve ficar
dentro do canvas de 480px — P0. Soma a área segura inferior — P1.
**Tokens.** `--color-neutral-100` → migrar para `--color-surface`,
`--text-micro`, `--color-accent-700`.
**Erros comuns.** Mais de 6 abas. Ícone sem rótulo.
**Converge:** o `nav` do painel.

## FAB

**Objetivo.** A ação de criação primária de uma aba.
**Usar em** abas cuja ação principal é criar algo. **Não usar** em telas de
detalhe, nem quando a ação já tem lugar próprio no cabeçalho.
**Anatomia.** Botão circular de 54px, `--color-accent`, ícone `+`, 100px acima
do rodapé.
**Variantes.** `simples` (ação direta) · `menu` (abre `BottomSheet` com opções).
**Estados.** `default` · `pressed` (escala com curva elástica discreta) ·
`focus-visible` · `expanded` (ícone gira até 45° enquanto as opções abrem).
**Hierarquia.** Um FAB por tela, no máximo. Some no detalhe.
**Toque.** 54px, acima do alcance do polegar da borda inferior.
**Acessibilidade.** `aria-label` descrevendo a ação real ("Cadastrar produto"),
não "Adicionar". `aria-expanded` na variante `menu`.
**Responsividade.** ⚠ **Hoje se ancora na borda da janela.** Deve ancorar na
borda do canvas — P0.
**Tokens.** `--color-accent`, `--radius-circle`, `--elevation-raised`,
`--ease-spring`.
**Erros comuns.** FAB em tela sem ação de criação. Dois botões flutuantes com
alturas diferentes (já corrigido: ambos 54px — manter).
**Converge:** `.fab` (Estoque) e `.fab-today` (Agenda, que é navegação, não
criação — mantém tratamento neutro contornado).

## BottomSheet

**Objetivo.** Escolha ou formulário curto sem sair do contexto.
**Usar em** ordenação, filtros avançados, opções do FAB, edição rápida.
**Não usar** para fluxo de várias etapas — é tela.
**Anatomia.** Fundo escurecido → folha subindo do rodapé, cantos superiores em
`--radius-xl`, alça opcional, título, conteúdo, ação primária.
**Variantes.** `opções` (lista de escolhas) · `formulário` · `confirmação`.
**Estados.** `entering` · `open` · `exiting` · `loading` · `error`.
**Hierarquia.** Uma folha por vez. Nunca folha sobre folha.
**Toque.** Fecha ao tocar o fundo escurecido e ao arrastar para baixo. Fecha com
`Esc`.
**Acessibilidade.** ⚠ **Nenhum tratamento existe hoje.** Requer `role="dialog"`,
`aria-modal="true"`, **captura de foco**, **restauração do foco** ao fechar, e
conteúdo de fundo inerte. **P0** ([07 §8](07_ACCESSIBILITY.md)).
**Responsividade.** Largura do canvas. Altura máxima ~85% da tela, com rolagem
interna. Respeita a área segura inferior.
**Tokens.** `--radius-xl`, `--elevation-overlay`, `--motion-emphasized`.
**Erros comuns.** Folha alta demais. Fundo que continua rolando por trás.
**Converge:** `.modal-sheet` / `.sheet-option`, a folha do FAB do estoque e a de
ordenação de clientes.

## FullScreenSheet

**Objetivo.** Fluxo ou formulário que precisa da tela inteira, sem virar uma
aba de primeiro nível.
**Usar em** fluxo de várias etapas (novo agendamento), formulário com mais de
três blocos (bloquear horário), e menu de entrada que abre esses dois.
**Não usar** para escolha curta ou confirmação — aí é `BottomSheet`, que
continua sendo o padrão. Uma folha de tela cheia para escolher entre duas
opções de ordenação seria peso demais para a decisão.
**Anatomia.** Fundo escurecido → folha subindo do rodapé até o topo da
viewport → **head** (voltar e/ou fechar + título + subtítulo opcional) →
**body** rolável → **footer** fixo com o CTA. A repetição dessa anatomia entre
níveis é o que faz eles parecerem o mesmo produto.
**Variantes.** `menu` (ações grandes) · `formulário` · `wizard` (com
indicador de etapas entre head e body).
**Estados.** `entering` · `open` · `exiting` · `loading` · `error`.
**Hierarquia.** Uma folha por vez. Um nível pode substituir o outro (menu →
formulário), nunca empilhar.
**Toque.** Fecha pelo `X` da head e pelo fundo escurecido nas laterais (só
existe no desktop). Fecha com `Esc`. **Não** fecha por arraste: o gesto
conflita com a rolagem do corpo, que aqui é a interação principal.
**Movimento.** `translateY(100%) → 0` em `--motion-emphasized` + `--ease-out`
— mesma receita de folha inferior ([05 §14](05_MOTION_SYSTEM.md)); muda o
destino, não a curva. Respeita `prefers-reduced-motion`.
**Acessibilidade.** `role="dialog"`, `aria-modal="true"`, rótulo na folha.
⚠ Herda de `BottomSheet` a pendência de **captura e restauração de foco** e
de tornar o fundo inerte — **P0** ([07 §8](07_ACCESSIBILITY.md)).
**Responsividade.** Altura `100dvh` (não `100vh`: no Safari do iPhone o `100vh`
conta a barra de endereço que some ao rolar, e o CTA do rodapé cairia atrás do
chrome do navegador). Largura até `--canvas-max-width`, centralizada — no
desktop **não estica**. `--safe-top` na head, `--safe-bottom` no footer.
**Tokens.** `--canvas-max-width`, `--elevation-overlay`, `--motion-emphasized`,
`--ease-out`, `--safe-top`, `--safe-bottom`.
**Erros comuns.** Raio nos cantos superiores — raio superior é o sinal de "há
tela atrás de mim", e aqui a folha **é** a tela. CTA rolando junto com o corpo
em vez de ficar fixo no rodapé. Usar para uma escolha de dois itens.
**Converge:** `.o-fullsheet` e `.o-wizard-sheet` (Agenda).

## ConfirmationDialog

**Objetivo.** Confirmar uma ação irreversível.
**Usar em** exclusão, cancelamento de atendimento, qualquer perda de dado.
**Não usar** em ação reversível — é ruído ([02 §5](02_DESIGN_PRINCIPLES.md)).
**Anatomia.** Título nomeando a ação e o objeto → consequência, se não óbvia →
ação destrutiva + cancelar.
**Variantes.** `destrutivo` · `neutro`.
**Estados.** `default` · `loading` (ação em andamento) · `error`.
**Hierarquia.** A ação destrutiva **não** recebe foco inicial.
**Toque.** Botões de largura total, empilhados. Cancelar por último na ordem
visual, primeiro na ordem de foco.
**Acessibilidade.** `role="alertdialog"`, captura e restauração de foco, `Esc`
cancela.
**Responsividade.** Largura do canvas menos gutter.
**Tokens.** `BottomSheet` + `Button destructive`.
**Erros comuns.** "Tem certeza?" sem nomear o objeto. Botão "Confirmar".
**Converge:** as confirmações atuais de exclusão.

## Toast

**Objetivo.** Confirmar que algo aconteceu, sem interromper.
**Usar em** sucesso de gravação, ação concluída.
**Não usar** para erro que exige ação (é `Banner` ou mensagem no campo), nem
para informação que a pessoa precisa reler.
**Anatomia.** Pílula no topo, fundo `--color-accent-700`, texto claro, 3s.
**Variantes.** `sucesso` · `informação` · `com desfazer`.
**Estados.** `entering` (desliza de cima) · `visible` · `exiting`.
**Hierarquia.** Um por vez. Não bloqueia nada.
**Toque.** Tocar dispensa. A variante `com desfazer` tem alvo de 44px e dura 5s.
**Acessibilidade.** ⚠ **Não existe `aria-live` no projeto.** O toast precisa de
`role="status"` + `aria-live="polite"`. **P1.**
**Responsividade.** Largura de conteúdo, centralizado no canvas.
**Tokens.** `--color-accent-700` (fundo sólido com texto — 5,02:1, aprovado em
03/08/2026, ver [03 §6](03_DESIGN_SYSTEM.md)), `--radius-full`,
`--motion-standard`.
**Erros comuns.** Toast para erro crítico. Fila de toasts empilhados.
**Converge:** `#toast`.

## Banner

**Objetivo.** Condição persistente que afeta a tela inteira.
**Usar em** offline, sessão expirada, dado desatualizado.
**Não usar** para confirmação pontual (é `Toast`) nem promoção (não existe).
**Anatomia.** Faixa no topo do conteúdo, ícone + texto + ação opcional.
**Variantes.** `atenção` (caramelo) · `crítico` (vermelho) · `neutro`.
**Estados.** `visible` (enquanto a condição durar) · `dismissed` quando o
usuário pode dispensar.
**Hierarquia.** Acima do conteúdo, abaixo do cabeçalho. Não flutua.
**Toque.** A ação tem 44px.
**Acessibilidade.** `role="status"` para atenção, `role="alert"` para crítico.
**Responsividade.** Largura do canvas.
**Tokens.** Pares de estado, `--radius-md`.
**Erros comuns.** Banner que não some quando a condição acaba. Banner para algo
que não exige nada de ninguém.
**Converge:** não existe hoje. Componente novo — **P1**, necessário para o
estado offline.

## EmptyState

**Objetivo.** Explicar por que não há nada e oferecer uma saída.
**Usar em** lista vazia de primeira vez, galeria sem foto.
**Não usar** para lista filtrada sem resultado — é `NoResultsState`.
**Anatomia.** Ícone discreto → frase que explica → legenda opcional → uma ação
primária.
**Variantes.** `convite` (nunca teve dado, com ação) · `neutro` (vazio normal,
sem ação — um dia sem atendimento).
**Estados.** Estático.
**Hierarquia.** Centralizado no espaço da lista. Discreto.
**Toque.** A ação tem 44px.
**Acessibilidade.** Texto real, não imagem com texto.
**Responsividade.** Centralizado, com margem lateral generosa.
**Tokens.** `--color-neutral-600`, `--text-body`, `--space-8`.
**Erros comuns.** Ilustração grande. Convite para criar em contexto onde criar
não faz sentido.
**Converge:** `.photo-empty-state` — **modelo correto**, generalizar.

## ErrorState

**Objetivo.** Comunicar falha de carregamento com caminho de recuperação.
**Usar em** falha de leitura de lista ou tela.
**Não usar** para erro de validação (é o campo) nem falha de gravação pontual
(é `Toast` ou `Banner`).
**Anatomia.** Ícone neutro → o que não aconteceu → "Tentar de novo".
**Variantes.** `recuperável` (com repetição) · `crítico` (sem repetição, com
orientação).
**Estados.** `default` · `retrying`.
**Hierarquia.** Ocupa o lugar do conteúdo que falhou. Não cobre a tela inteira.
**Toque.** Botão de repetição com 44px.
**Acessibilidade.** `role="alert"`. Mensagem sem termo técnico
([06 §14](06_CONTENT_GUIDELINES.md)).
**Responsividade.** Igual ao `EmptyState`.
**Tokens.** `--color-neutral-600`, `Button secondary`.
**Erros comuns.** Mostrar código de erro. Não oferecer repetição.
**Converge:** não existe hoje de forma consistente. **P1.**

## LoadingState

**Objetivo.** Ocupar a tela enquanto o conteúdo chega.
**Usar em** primeiro carregamento de lista ou tela.
**Não usar** em recarga com dado já em tela — ali é atualização silenciosa.
**Anatomia.** Composição de `Skeleton` com a geometria real do conteúdo.
**Variantes.** `lista` · `detalhe` · `métricas`.
**Estados.** `loading` → conteúdo. Sem estado intermediário.
**Hierarquia.** Substitui o conteúdo exatamente no lugar dele.
**Toque.** Inerte.
**Acessibilidade.** `aria-busy="true"` no container.
**Responsividade.** Acompanha a do conteúdo.
**Tokens.** `Skeleton`.
**Erros comuns.** Spinner em tela cheia. Skeleton com geometria diferente, o
que faz a tela "pular".
**Converge:** não existe hoje. **P1.**

## FilterSheet

**Objetivo.** Filtros que não cabem na faixa de chips.
**Usar em** mais de 5 filtros, ou filtros combináveis.
**Não usar** em até 5 filtros exclusivos — a faixa de chips resolve.
**Anatomia.** `BottomSheet` com grupos de opções → "Limpar" e "Aplicar".
**Variantes.** `exclusivo` · `múltiplo`.
**Estados.** `default` · `com filtros ativos` (contador visível) · `loading`.
**Hierarquia.** "Aplicar" é a ação primária. "Limpar" é fantasma.
**Toque.** Opções com 44px.
**Acessibilidade.** Herda de `BottomSheet`. Grupos com `fieldset`/`legend`.
**Responsividade.** Herda de `BottomSheet`.
**Tokens.** `BottomSheet`, `Chip`.
**Erros comuns.** Aplicar filtro a cada toque sem confirmação, quando são
múltiplos.
**Converge:** não existe hoje — os filtros atuais cabem na faixa. **Componente
futuro**, criar só quando necessário.

## SortSheet

**Objetivo.** Escolher a ordenação de uma lista.
**Usar em** listas com mais de 50 itens esperados.
**Não usar** quando só existe uma ordem sensata.
**Anatomia.** `BottomSheet` com lista de opções, marca de seleção na ativa.
**Variantes.** Única.
**Estados.** `default` · `selecionado`.
**Hierarquia.** Seleção aplica e fecha imediatamente — não tem "Aplicar".
**Toque.** Cada opção com 44px.
**Acessibilidade.** `role="radiogroup"` com opção marcada.
**Responsividade.** Herda de `BottomSheet`.
**Tokens.** `BottomSheet`, `--text-body`.
**Erros comuns.** Ordenação que não persiste ao voltar do detalhe.
**Converge:** `.sheet-option` da ordenação de clientes — implementação já
correta. Ordens atuais: Última visita · Nome (A–Z) · Maior gasto · Mais
frequentes · VIP primeiro.

---

## Mapa de convergência — resumo

| Inconsistência atual | Destino | Bloqueio |
|---|---|---|
| Duas identidades de `.btn` | `Button` | decidir caixa alta |
| `.btn-see-more` + `.see-more-btn` | `Button ghost` com chevron | nenhum |
| `.filter-chip` + `.hair-chip` + segmentado | `Chip` (3 variantes) | nenhum |
| 4 raios de card (16/18/22/14) | `Card` | ✅ convergência aprovada — migração gradual |
| `.badge` + `.tag-*` | `Badge` | nenhum |
| 3 receitas de sombra de hover | `--elevation-hover` | nenhum |
| 2 recuos de `--shadow-md` | `--elevation-raised` | nenhum |
| `--color-neutral-100` em `.card`/`.action-row` | `--color-surface` | nenhum |
| Foco de busca dependente de JS | `SearchField` | nenhum |
| Controles de 18/26/28px | `IconButton` 44px | nenhum |
| Grid de fotos × galeria com rolagem | um padrão só | decidir qual |
| Sem `Skeleton`, `Banner`, `ErrorState`, `Spinner` | componentes novos | nenhum |

---

**Próximo documento:** [05 — Motion System](05_MOTION_SYSTEM.md).
