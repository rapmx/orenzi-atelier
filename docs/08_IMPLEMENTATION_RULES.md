# 08 — Implementation Rules

**Versão 1.0 · 03/08/2026**

Como implementar o Design System na arquitetura que existe: HTML, CSS e
JavaScript puros, sem build.

> **Nada aqui foi implementado.** Este documento define o método e a ordem.
> A execução depende de aprovação — ver §23.

---

## 1. Estado atual

| Fato | Situação |
|---|---|
| Framework | nenhum |
| Build, bundler, npm | nenhum — **e é proposital** |
| Arquivos | 4 HTMLs: `index.html` (69 KB), `agendar.html` (37 KB), `painel.html` (284 KB), `painel_demo.html` (298 KB) |
| CSS | inline em `<style>`; 1.317 linhas no painel |
| JS | inline; zero `<script src>` local |
| Dependências | `supabase-js@2` e Google Fonts, por CDN |
| Componentes | nenhum — "componente" é classe CSS + string de template |
| Duplicação | `painel_demo.html` é espelho do `painel.html`; o CSS dos dois difere em 3 linhas |
| Tokens | 3 blocos `:root` distintos, sincronizados à mão |

**Consequência central:** não existe hoje nenhum lugar onde um valor
compartilhado possa viver uma vez só. Todo token é copiado 3× (painel, demo,
agendar) ou 4× (com a landing).

---

## 2. Princípios de migração

1. **Nada quebra no dia 1.** A primeira entrega não muda um pixel — exceto o
   anel de foco, que hoje não existe.
2. **Coexistência antes de substituição.** O CSS novo e o inline convivem; o
   inline vence enquanto não for migrado.
3. **Um componente por vez, verificável.** Cada passo é revisável e reversível.
4. **Mudança visual é uma decisão separada da tokenização.** Nunca embutir uma
   na outra.
5. **Simplicidade acima de pureza.** Se uma abstração não paga a si mesma em um
   projeto de 4 arquivos, ela não entra.

---

## 3. Não fazer big-bang rewrite

**Reescrever qualquer um dos quatro arquivos está proibido.**

Motivos concretos, não teóricos:
- `painel.html` tem ~3.000 linhas com lógica de fuso horário, ocupação, modelo
  de segmentos e escrita autenticada. Regras que já falharam em silêncio uma
  vez.
- O produto está **em uso por uma cliente real**.
- Já houve perda de trabalho por sobrescrita entre sessões — foi o motivo de o
  git existir neste projeto.

**Regra:** toda mudança é cirúrgica e localizada. Se um passo exige tocar mais
de um componente, ele está grande demais e precisa ser quebrado.

---

## 4. Arquitetura recomendada sem build

**Decisão consolidada: aceitar CSS externo compartilhado.**

```
app/
  ds/
    orenzi-tokens.css       ← todos os tokens (:root)
    orenzi-base.css         ← reset, foco, movimento reduzido, shell centralizado
    orenzi-components.css   ← primitivos (.o-*)
  design-system.html        ← showcase isolado
  index.html                ← + 3 <link>
  agendar.html              ← + 3 <link>
  painel.html               ← + 3 <link>
  painel_demo.html          ← + 3 <link>
```

**Por que esta estrutura, e não outra.**

- **Por que arquivos externos.** É a única forma de um token viver uma vez só. A
  alternativa — duplicar o bloco de tokens nos quatro arquivos — mantém
  exatamente o problema que motivou a auditoria.
- **Por que três arquivos e não um.** Tokens, base e componentes têm ciclos de
  vida diferentes: tokens quase nunca mudam, componentes mudam sempre. Um
  arquivo só tornaria qualquer diff ilegível.
- **Por que não mais de três.** Um arquivo por componente exigiria dezenas de
  requisições sem HTTP/2 garantido, ou um passo de concatenação — que é um
  build. Não vale.
- **Por que `<link>` e não `@import`.** `@import` serializa o carregamento e
  atrasa a primeira pintura.
- **Por que não muda nada visualmente.** Os `<link>` entram **antes** do
  `<style>` inline. Pela cascata, o inline continua vencendo em todo conflito.
- **Por que funciona sem servidor.** Aberto por `file://`, um `<link>` relativo
  carrega normalmente. O projeto usa servidor estático de qualquer forma.

**O que esta estrutura não é.** Não é `src/design-system/` com pastas de tokens,
foundations, components e patterns — essa estrutura pressupõe um passo de
compilação que o projeto não tem e não vai ganhar. O documento provisório a
sugeria; está corrigido.

---

## 5. Tokens compartilhados

`orenzi-tokens.css` contém **um único bloco `:root`** com todos os tokens de
[03 — Design System](03_DESIGN_SYSTEM.md).

**Regras.**
1. **Nenhuma regra de componente neste arquivo.** Só declarações de variável.
2. Nomes seguem o que já existe: `--color-*`, `--font-*`, e as famílias novas
   `--text-*`, `--space-*`, `--radius-*`, `--elevation-*`, `--motion-*`,
   `--ease-*`, `--border-*`.
3. **Nenhuma camada de alias.** Decisão do dono do produto: a proposta original
   de criar `--o-*` apontando para `--color-*` foi **recusada por adicionar
   indireção sem benefício**. Os tokens são os nomes finais.
4. Todo valor vem do código atual. Nenhum valor novo entra sem aprovação.
5. Um comentário por token que tenha história (o par de verdes, o gutter de
   20px, a ausência de amarelo).

**Efeito imediato:** os `:root` dos quatro HTMLs passam a ser redundantes. Eles
**permanecem** durante a coexistência (§10) e saem quando o arquivo for migrado.

---

## 6. Base global

`orenzi-base.css` contém apenas o que é seguro aplicar globalmente sem revisar
tela por tela:

1. **Anel de foco** — `:focus-visible` com `--focus-ring`. Corrige P0-1 de
   [07 §19](07_ACCESSIBILITY.md).
2. **Movimento reduzido** — bloco `@media` global zerando duração e
   transformação. Corrige P0-5 (`agendar.html`).
3. **Shell centralizado** — a classe `.o-app-shell` **definida, ainda não
   aplicada**. Aplicar é um passo separado (§14).
4. **Higiene mínima** — `box-sizing: border-box`, `-webkit-tap-highlight-color`
   transparente, `font-variant-numeric: tabular-nums` em classe utilitária.

**Proibido neste arquivo:** qualquer regra que altere tipografia, cor ou
espaçamento de elementos existentes. Isso mudaria as telas sem revisão.

---

## 7. Componentes CSS

`orenzi-components.css` contém os primitivos de
[04 — Component Library](04_COMPONENT_LIBRARY.md), com prefixo `.o-`.

**Regras.**
1. **Prefixo `.o-` em tudo.** Garante que nenhuma classe nova colida com as
   existentes — condição para a coexistência.
2. **Zero valor literal.** Só `var(--token)`.
3. Todo componente traz seus estados: padrão, pressionado, foco visível,
   desabilitado, carregando, erro.
4. Especificidade de uma classe só. Nada de `!important`, nada de aninhamento
   profundo.
5. Nenhum seletor de elemento nu (`button { }`) — afetaria o que já existe.

---

## 8. JavaScript utilitário

**Regra geral: o mínimo possível.** O JS do produto continua inline.

Um único arquivo novo se justifica, e só quando os componentes que dependem dele
forem construídos:

```
app/ds/orenzi-ui.js    ← utilitários de acessibilidade
```

Conteúdo previsto, nada além:
- captura e restauração de foco para folhas e diálogos (P0-4);
- anúncio por `aria-live` (P1-8);
- verificação de `prefers-reduced-motion` compartilhada.

**Proibido:** framework, sistema de componentes em JS, roteador, gerenciador de
estado, template engine.

**Padrão obrigatório:** funções puras, sem estado global, sem dependência da
ordem de carregamento. O arquivo entra com `defer`.

---

## 9. Prefixos

| Camada | Prefixo | Exemplo |
|---|---|---|
| Tokens | `--` sem prefixo extra | `--color-accent`, `--space-4` |
| Primitivos | `.o-` | `.o-btn`, `.o-card`, `.o-chip` |
| Padrões compostos | `.o-` | `.o-sheet`, `.o-empty-state` |
| Componentes de produto | nome de domínio, sem prefixo | `.client-card`, `.timeline-appt` |
| Utilitário JS | `orenziUI.` | `orenziUI.trapFocus(el)` |

**Por que componentes de produto não levam prefixo.** Eles são específicos deste
produto e não têm com o que colidir. Renomeá-los seria churn sem ganho.

---

## 10. Compatibilidade progressiva

Durante a migração convivem dois sistemas. As regras de convivência:

1. **A cascata resolve.** `<link>` antes de `<style>` — o inline vence enquanto
   existir.
2. **Classe nova não substitui classe velha automaticamente.** A troca é feita no
   markup, componente por componente.
3. **Um componente migrado perde o CSS inline dele no mesmo passo.** Deixar os
   dois é como divergem.
4. **Os `:root` antigos só saem quando o arquivo inteiro estiver migrado.**
5. **Migração parcial de arquivo é aceitável.** O painel pode ter botões
   migrados e cards não.

**Verificação de cada passo:** o componente migrado é comparado com o anterior
lado a lado. Nenhuma diferença visual não intencional.

---

## 11. Estratégia de aliases

**Decisão: não haverá camada de alias.**

A auditoria propôs criar `--o-color-action-primary: var(--color-accent)` para
permitir renomear tudo sem tocar em componente. Foi **recusado**: adiciona uma
indireção que precisa ser resolvida mentalmente a cada leitura, para resolver um
problema de renomeação que não temos.

**A única exceção — e ela é temporária:**

```css
/* --color-neutral-100 é a mesma cor que --color-surface.
   Alias de compatibilidade enquanto o markup antigo existir. Remover
   quando `.card` e `.action-row` tiverem migrado. */
--color-neutral-100: var(--color-surface);
```

Isso não é uma camada de alias — é um token depreciado apontando para o
substituto, com data de remoção. Ver [03 §3](03_DESIGN_SYSTEM.md).

---

## 12. Estratégia de remoção de CSS inline

`painel.html` tem **65 atributos `style=`** e `agendar.html` tem 5.

**Classificação obrigatória antes de remover qualquer um:**

| Tipo | Exemplo | Destino |
|---|---|---|
| **Geometria calculada** | posição e altura de bloco na timeline, recuo de encaixe | **permanece inline** — é dado, não estilo |
| **Valor de estado** | as duas variáveis de cor de estado do estoque | permanece, mas via propriedade customizada |
| **Estilo estático** | `style="margin-top:8px"` | vira classe |
| **Estilo condicional** | `style="display:none"` | vira classe de estado |

**Regra:** só o terceiro e o quarto tipos migram. Tentar mover geometria
calculada para CSS quebraria a agenda.

---

## 13. Estratégia de migração de componentes

Para cada componente, na ordem:

1. **Inventariar.** Localizar todas as classes que fazem esse papel hoje (a
   tabela de convergência de [04](04_COMPONENT_LIBRARY.md)).
2. **Comparar.** Listar as diferenças reais entre as implementações.
3. **Decidir.** Onde divergem, escolher — e registrar a escolha. Diferença que
   afeta identidade vira decisão pendente, não escolha do implementador.
4. **Escrever** o primitivo `.o-*` em `orenzi-components.css`, com todos os
   estados.
5. **Publicar** no showcase (§18) e revisar isolado em 320/390/430px.
6. **Migrar o markup** de um lugar, comparar com o anterior lado a lado.
7. **Migrar os demais** lugares.
8. **Remover** o CSS inline daquele componente, nos dois espelhos.
9. **Commitar** com o antes e o depois descritos.

**Nunca pular o passo 5.** Componente revisado isolado é onde os estados são
realmente testados — em tela cheia, ninguém aciona o estado desabilitado.

---

## 14. Shell mobile centralizado

**Problema atual:** o conteúdo principal é centralizado em 480px, mas o
cabeçalho, a barra de navegação e os dois botões flutuantes se ancoram na
janela. No desktop, o produto se espalha.

**Solução: um container único envolvendo tudo.**

```
.o-app-shell            → max-width: 480px; margin: 0 auto; position: relative;
.o-app-shell__fixed     → position: fixed; left: 50%;
                          transform: translateX(-50%);
                          width: 100%; max-width: 480px;
```

Elementos fixos (barra inferior, FAB, botão "Hoje", toast) usam o segundo
padrão. Os botões flutuantes se posicionam **em relação à borda do canvas**, não
da janela.

**O padrão já existe no código**, no modo tela cheia do questionário. Não é
invenção — é aplicação do que já funciona.

**Risco:** `position: fixed` dentro de um ancestral com `transform` ou `filter`
passa a se ancorar nesse ancestral. Verificar que nenhum ancestral do shell tem
essas propriedades antes de aplicar.

**Verificação:** abrir em 1440px de largura. Cabeçalho, conteúdo, barra e botões
alinhados na mesma coluna de 480px.

---

## 15. Browser desktop

- O aplicativo é a mesma coluna de 480px, centralizada.
- Nenhum layout alternativo. Nenhuma coluna lateral. Nenhuma tabela.
- Hover é cortesia; nada essencial depende dele ([05 §6](05_MOTION_SYSTEM.md)).
- Teclado funciona por inteiro ([07 §5](07_ACCESSIBILITY.md)).
- ⚠ **PENDENTE:** o que aparece ao lado do canvas. Hoje é fundo liso — nenhuma
  decisão foi tomada ([03 §21 P6](03_DESIGN_SYSTEM.md)).

**A landing é exceção legítima.** É desktop-first, tem seus próprios pontos de
quebra e não entra nesta regra.

---

## 16. Safe areas

Implementação em `orenzi-base.css`, aplicada aos elementos fixos:

```
padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
```

Aplicar a: barra de navegação, botões flutuantes, folhas inferiores e ao
`padding-bottom` do corpo.

**Verificação:** iPhone com barra inferior. A barra de navegação não pode ficar
sob a barra do sistema.

---

## 17. Testes

Não há framework de teste e **não é o momento de introduzir um.** O que existe
é verificação manual disciplinada.

**Por componente** (no showcase):
- [ ] Todos os estados visíveis e corretos
- [ ] 320 / 390 / 430px
- [ ] Navegação por teclado com foco visível
- [ ] Contraste medido no navegador, não estimado
- [ ] Movimento reduzido ativado

**Por migração:**
- [ ] Comparação lado a lado com o anterior
- [ ] Nenhuma diferença visual não intencional
- [ ] Console sem erro novo (nota de 02/08 sobre 2 erros ao carregar o
      `painel_demo.html` não foi reproduzida em 06/08 após testar carga,
      as 6 abas e o wizard completo — não tratar como linha de base aceita)
- [ ] Painel e demo com o mesmo resultado
- [ ] Fluxo real exercitado: agendar, alterar estoque, abrir perfil

**Medição, não estimativa.** Contraste e alinhamento se verificam no navegador.
Já houve caso de 9,6px de desalinhamento invisível a olho nu e óbvio na medição.

---

## 18. Showcase `/design-system`

`app/design-system.html` — um HTML estático, sem Supabase, sem autenticação, que
importa os três CSS e exibe todos os primitivos em todos os estados.

**Conteúdo:**
- paleta com valor e razão de contraste medida ao lado;
- escala tipográfica, de espaçamento, de raio, de elevação;
- cada primitivo em todas as variantes e estados, inclusive desabilitado,
  carregando e erro;
- alternador de largura (320/390/430) e de movimento reduzido;
- exemplos de estado vazio, sem resultado, erro e carregando.

**Por que existe.** É o Storybook possível sem build. Sem ele, estados raros
(desabilitado, carregando, erro) nunca são revisados — só se descobre que estão
errados quando um cliente encontra.

**Regra:** componente que não está no showcase não está pronto.

---

## 19. Ordem de migração

### PR 1 — Fundamentos *(não muda nenhuma tela)*
- Criar os três CSS e o showcase.
- Adicionar os `<link>` nos quatro HTMLs.
- Anel de foco global (P0-1) e movimento reduzido em `agendar.html` (P0-5).
- **Efeito visual: apenas o anel de foco, que hoje não existe.**

### PR 2 — Primitivos no showcase *(não toca nas telas)*
- `Button`, `IconButton`, `Card`, `Input`, `SearchField`, `Chip`, `Badge`,
  `Skeleton` escritos e revisados isolados.

### PR 3 — Shell centralizado
- `.o-app-shell` aplicado (P0-7). Áreas seguras (P1-11).
- **Muda o desktop de propósito**; o celular fica idêntico.

### PR 4 — Acessibilidade de baixo risco
- Rótulos associados (P0-2), áreas de toque estendidas (P0-3),
  `aria-label` faltantes (P1-10), `role="status"` no toast (P1-9).
- **Nenhuma mudança visual.**

### PR 5 — Botão
- Unificar as duas identidades de `.btn`. Sentence case, fundo
  `--color-accent-700` — decisões já aprovadas em 03/08/2026.

### PR 6 — Chip e Badge
- Unificar os três chips e os badges/tags. Remover os valores de recuo verdes de
  `.tag-accent-2`.

### PR 7 — Card
- Unificar a família. Convergência de raios já aprovada (18→16, 22→20, 14→12).

### PR 8 — Folhas e diálogos
- Captura e restauração de foco (P0-4). `ConfirmationDialog`.

### PR 9 — Estados
- `Skeleton`, `EmptyState`, `ErrorState`, `Banner` aplicados nas telas.

### PR 10+ — Tela a tela
- Ordem sugerida: Estoque → Clientes → Agenda → Insights → Início →
  Questionário → `agendar.html`.
- **Estoque primeiro** porque já é o mais próximo do padrão — a migração valida
  o método com risco baixo.
- **`agendar.html` por último** porque é a página da cliente, com maior risco de
  regressão visível para quem não conhece o produto.

**Toda mudança de tela entra em `painel.html` e `painel_demo.html`.** Sem
exceção.

---

## 20. Definition of Done técnico

Um passo de migração está pronto quando:

- [ ] Nenhum valor literal — só `var(--token)`
- [ ] Todos os estados implementados
- [ ] Presente no showcase
- [ ] O CSS inline substituído foi removido
- [ ] Painel e demo espelhados
- [ ] 320 / 390 / 430px verificados
- [ ] Teclado percorre com foco visível
- [ ] Movimento reduzido verificado
- [ ] Contraste medido
- [ ] Comparação lado a lado sem diferença não intencional
- [ ] Console sem erro novo
- [ ] Commit e push feitos ([10](10_GOVERNANCE_AND_CHANGELOG.md))
- [ ] Documento atualizado se alguma regra mudou

---

## 21. Restrições

**Proibido sem decisão explícita e registrada:**

1. React, Vue, Svelte ou qualquer framework de componentes.
2. Tailwind, SASS, PostCSS ou qualquer pré-processador.
3. Vite, webpack, esbuild ou qualquer bundler.
4. npm, `package.json`, `node_modules`.
5. TypeScript.
6. Qualquer biblioteca de UI.
7. Web Components / Shadow DOM.
8. Um segundo sistema de estilos convivendo com este.
9. Reescrever qualquer um dos quatro HTMLs.
10. Alterar backend, banco, RPCs, gatilhos, rotas ou regras de negócio.

**Também proibido:**
11. Migrar mais de um componente por passo.
12. Misturar tokenização com mudança visual no mesmo commit.
13. Tocar no painel sem tocar no demo.
14. Introduzir valor visual que não é token.

---

## 22. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Divergência painel/demo durante a migração | **alta** | médio | comparar o CSS dos dois a cada passo |
| Sobrescrita entre sessões (Claude Code × Claude Chat) | **média** | **alto** | commitar e dar push ao fim de cada passo — motivo pelo qual o git existe aqui |
| Mudança visual acidental na tokenização | média | alto | `<link>` antes de `<style>`; comparação lado a lado |
| `position: fixed` dentro de ancestral com `transform` | média | alto | verificar antes de aplicar o shell (§14) |
| Regressão em `agendar.html` (página da cliente) | baixa | **alto** | migrar por último |
| Quebra do fuso ou da ocupação por edição vizinha | baixa | **crítico** | não tocar em JS de domínio; mudanças só em CSS e markup |
| Migração parar no meio, deixando dois sistemas | **média** | médio | PR 1–4 já entregam valor por si; a partir do 5 é incremental |
| CSS externo bloquear a primeira pintura | baixa | baixo | 3 arquivos pequenos; `<link>` no `<head>` |

---

## 23. Decisões que exigem aprovação

### ✅ Resolvidas em 03/08/2026

| # | Decisão | Origem |
|---|---|---|
| 1 | Criar os arquivos em `app/ds/` | **aprovado** |
| 2 | Contraste do CTA primário → `--color-accent-700` | **aprovado** — [03 §6](03_DESIGN_SYSTEM.md) |
| 3 | Convergência de raios (18→16, 22→20, 14→12) | **aprovado** — [03 §11](03_DESIGN_SYSTEM.md) |
| 4 | Caixa alta no botão → eliminada, sentence case | **aprovado** — [04 — Button](04_COMPONENT_LIBRARY.md#button) |
| 5 | Branco sobre caramelo → sólidos em `accent-700`, avatar em `accent-100`/`accent-700` | **aprovado** — [03 §6](03_DESIGN_SYSTEM.md) |
| 6 | Fotos → galeria horizontal como padrão mobile; grade só em ampliação/desktop | **aprovado** — [03 §15](03_DESIGN_SYSTEM.md) |
| 7 | Laterais do canvas no desktop → `--color-bg` liso, sem moldura nem decoração | **aprovado** — [03 §17](03_DESIGN_SYSTEM.md) |
| 8 | Cormorant Garamond → exclusiva da landing | **aprovado** — [03 §7](03_DESIGN_SYSTEM.md) |

### Em aberto

| # | Decisão | Bloqueia | Origem |
|---|---|---|---|
| 9 | Tamanho de fonte dos campos em iOS (zoom automático) | PR 4 | [07 §3](07_ACCESSIBILITY.md) |
| 10 | Avatar `sm` a 4,36:1 (3% abaixo do mínimo) | PR de Avatar | [03 §21 P9](03_DESIGN_SYSTEM.md) |
| 11 | Borda no avatar tingido, hoje a 1,15:1 contra o fundo | PR de Avatar | [03 §21 P10](03_DESIGN_SYSTEM.md) |
| 12 | Nomenclatura da landing (`--ink`/`--paper` → `--color-*`) | — | [03 §21 P5](03_DESIGN_SYSTEM.md) |

---

**Próximo documento:** [09 — UX Patterns](09_UX_PATTERNS.md).
