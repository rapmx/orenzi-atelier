# 03 — Design System

**Versão 1.0 · 03/08/2026**
**Substitui `ORENZI_DESIGN_SYSTEM_v1.0.md`**, cujos valores eram provisórios e
divergiam do produto real.

> **Fonte de verdade:** o código. Todos os valores abaixo foram extraídos do
> `:root` e das regras de `app/painel.html`, `app/agendar.html` e
> `app/index.html` na auditoria de 03/08/2026. Nenhum valor foi inventado.
> Onde falta informação, está escrito **PENDENTE**.

---

## 1. Filosofia visual

O Orenzi é **quente, minimalista e discreto**. A paleta vem de um ambiente
físico — papel, madeira, couro, luz de manhã — não de um painel de controle.

Quatro regras que governam tudo neste documento:

1. **Neutro é o padrão.** Cor fora dos neutros significa alguma coisa.
2. **A borda é mais barata que a sombra.** Cartões se separam por uma linha de
   1px. Sombra existe só para o que realmente flutua.
3. **A escala é curta.** Menos degraus, usados com disciplina, produzem mais
   coerência do que uma escala longa usada por aproximação.
4. **Nenhum valor visual nasce em uma tela.** Se não é token, não entra.

---

## 2. Nomenclatura de tokens

**Decisão consolidada em 03/08/2026:** mantemos o prefixo `--color-*` que já
existe no código e estendemos a mesma convenção para as famílias que faltam.

Isto substitui a proposta da auditoria de criar uma camada `--o-*` paralela com
aliases. A camada de alias foi **adiada** por decisão do dono do produto —
adiciona indireção sem benefício imediato em um projeto de quatro arquivos.

**Convenção:** `--<família>-<papel>[-<intensidade>]`

| Família | Prefixo | Situação |
|---|---|---|
| Cor | `--color-*` | **existe no código** |
| Tipografia — família | `--font-*` | **existe no código** |
| Tipografia — tamanho | `--text-*` | a criar |
| Espaçamento | `--space-*` | a criar |
| Raio | `--radius-*` | existe só em `agendar.html`, sem uso |
| Elevação | `--elevation-*` | a criar (hoje `--shadow-md` é referenciado sem existir) |
| Movimento | `--motion-*`, `--ease-*` | a criar |
| Borda | `--border-*` | a criar |

**Regras de nome.**
- Nomes em inglês, para casar com CSS e facilitar implementação.
- Escala de intensidade em centenas (100 = mais claro, 700 = mais escuro), como
  o código já faz.
- Nunca nomear pela aparência (`--marrom-claro`) — sempre pelo papel.
- Nunca criar token de instância (`--radius-do-card-de-cliente`).

---

## 3. Cores primitivas

Os valores brutos da marca. **Não usar diretamente em componente** — usar
através dos papéis semânticos da seção 4.

### Neutros quentes

| Token | Valor | Observação |
|---|---|---|
| `--color-bg` | `#f3ede4` | creme de fundo |
| `--color-surface` | `#f7f1e8` | creme de cartão |
| `--color-neutral-100` | `#f7f1e8` | ⚠ **hex idêntico a `--color-surface`** |
| `--color-neutral-200` | `#e8ddce` | bege médio |
| `--color-neutral-300` | `#ddcfba` | bege escuro |
| `--color-neutral-600` | `#6b6053` | marrom acinzentado |
| `--color-neutral-700` | `#5c4f42` | marrom escuro |
| `--color-text` | `#2b2420` | quase-preto quente |
| `--color-divider` | `rgba(43,36,32,0.14)` | linha translúcida |

⚠ **`--color-neutral-100` e `--color-surface` são a mesma cor com dois nomes**,
e o código usa os dois de forma intercambiável. **Decisão: `--color-neutral-100`
é depreciado.** Migração em [08 §11](08_IMPLEMENTATION_RULES.md); nenhum código
novo pode usá-lo.

### Marca (caramelo)

| Token | Valor | Observação |
|---|---|---|
| `--color-accent-100` | `#ecdcc9` | fundo tingido |
| `--color-accent` | `#b6784a` | caramelo da marca |
| `--color-accent-600` | `#a1683f` | caramelo médio |
| `--color-accent-700` | `#8a5a34` | caramelo escuro |

### Alerta (vermelho)

| Token | Valor |
|---|---|
| `--color-accent-2-100` | `#f7e7e7` |
| `--color-accent-2` | `#b23a3a` |
| `--color-accent-2-700` | `#8a2a2a` |

⚠ `--color-accent-2-100` e `--color-accent-2-700` existem **apenas** em
`painel.html` e `painel_demo.html`. `agendar.html` e `index.html` não os têm.

### Sucesso (verde)

| Token | Valor | Situação |
|---|---|---|
| `--color-success-100` | `#e7f0e9` | **literal no CSS, não é token ainda** |
| `--color-success` | `#4f8a5b` | **literal no CSS** — uso gráfico |
| `--color-success-700` | `#3b6744` | **literal no CSS** — uso em texto |

O verde já é convenção do produto (cliente ativa, estoque saudável) mas nunca
foi promovido a token. Promovê-lo é ação de tokenização, não mudança visual.

**Por que dois verdes:** `#4f8a5b` como *texto* sobre o verde tingido dá
3,2:1 — reprova. Escurecido para `#3b6744`, dá 5,62:1. Ponto e texto não têm o
mesmo requisito de contraste. **Esta distinção é obrigatória e deve sobreviver
a qualquer refatoração.**

### Fora da paleta semântica

Cores de identificação, não de estado — **não** viram token semântico:

- `CATEGORY_COLORS` — 5 categorias de serviço na agenda (Alisamento, Coloração,
  Corte, Outros, Tratamentos), com hash estável para categorias novas.
- `STAFF_COLORS` — paleta por profissional.

**Regra permanente:** nenhuma dessas paletas pode usar `--color-accent-2`. O
vermelho é exclusivo de alerta.

### A landing usa a mesma paleta com outros nomes

`app/index.html` declara `--ink`, `--paper`, `--accent`… com **os mesmos hexes**.
Além disso tem três cores exclusivas: `#c99884` (rosé), `#faf6ef` (creme de
texto), `#e8c98a` (dourado das estrelas).

**Decisão:** a landing é peça de marketing e não faz parte do canvas do
aplicativo. Ela **adota os mesmos valores**, mas sua unificação de nomenclatura
é P2. As três cores exclusivas ficam registradas como **tokens de landing**, não
do produto.

---

## 4. Cores semânticas

O que cada papel significa e qual primitiva o serve. **Componentes usam esta
tabela, não a seção 3.**

| Papel | Token | Uso |
|---|---|---|
| Fundo da tela | `--color-bg` | corpo, viewport, **e as laterais do canvas no desktop** |
| Superfície de cartão | `--color-surface` | card, folha, modal |
| Superfície secundária | `--color-neutral-200` | tag neutra, faixa |
| Texto principal | `--color-text` | conteúdo essencial |
| Texto secundário | `--color-neutral-600` | metadado, legenda, placeholder |
| Texto terciário | `--color-neutral-700` | botão fantasma, rótulo discreto |
| Texto desabilitado | `--color-neutral-300` | controle inativo |
| Borda padrão | `--color-divider` | todo cartão e campo |
| Borda enfática | `--color-neutral-300` | separação que precisa ser vista |
| Ação primária (fundo) | `--color-accent` | ⚠ ver §6 — contraste insuficiente |
| Ação primária (texto sobre claro) | `--color-accent-700` | link, aba ativa, "ver mais" |
| Ação primária (hover/borda) | `--color-accent-600` | ícone de seção, borda de foco |
| Ação primária (tingido) | `--color-accent-100` | fundo de pílula, anel de foco |

---

## 5. Cores de estado

**Três degraus, não quatro. Não existe amarelo no Orenzi.** O degrau
intermediário de atenção é o caramelo da marca — decisão consciente, tomada
quando o padrão de estoque foi desenhado. Adicionar amarelo resolveria a
convenção de semáforo e quebraria a identidade. **Recusado.**

| Estado | Fundo tingido | Cor principal | Cor de texto |
|---|---|---|---|
| **Sucesso** | `#e7f0e9` | `#4f8a5b` | `#3b6744` |
| **Atenção** | `--color-accent-100` | `--color-accent` | `--color-accent-700` |
| **Crítico** | `--color-accent-2-100` | `--color-accent-2` | `--color-accent-2-700` |
| **Neutro / desconhecido** | `--color-neutral-200` | `--color-neutral-300` | `--color-neutral-600` |

### Padrão de implementação de estado

O estoque já resolve isso corretamente e é o modelo oficial: **cada classe de
estado declara apenas duas variáveis** — a cor principal e o fundo. Ponto,
badge, borda de cartão e ícone leem dessas duas. Mudar um estado é mudar dois
valores, em um lugar.

### Conjuntos de estado existentes

| Domínio | Estados | Regra |
|---|---|---|
| Estoque | `sem` · `crítico` · `baixo` · `ok` | `sem` = 0; `crítico` ≤ mínimo; `baixo` ≤ mínimo × 1,5 |
| Cliente | Nova · Ativa · Inativa | Nova ≤ 30 dias de cadastro; Inativa > 60 dias sem visita |
| Ocupação | livre · normal · lotada | "Agenda praticamente lotada" usa o par crítico |

**Estado nunca é comunicado só por cor** — ver [02 §7](02_DESIGN_PRINCIPLES.md)
e [07 §2](07_ACCESSIBILITY.md).

---

## 6. Contraste e uso correto

Medições WCAG 2.1 sobre `--color-bg` (`#f3ede4`), salvo indicação.

### Aprovados

| Par | Razão | Uso |
|---|---|---|
| `--color-text` / bg | **13,11:1** | texto principal |
| `--color-neutral-700` / bg | **6,80:1** | texto terciário |
| `--color-neutral-600` / bg | **5,27:1** | texto secundário |
| `--color-neutral-600` / surface | **5,46:1** | texto secundário em cartão |
| `--color-accent-700` / bg | **5,02:1** | texto de ação, aba ativa |
| `--color-accent-2` / bg | **5,07:1** | texto de alerta |
| `--color-accent-2-700` / accent-2-100 | **7,17:1** | texto em badge de alerta |
| `#3b6744` / `#e7f0e9` | **5,62:1** | texto em badge de sucesso |

### Reprovados — atenção obrigatória

| Par | Razão | Situação |
|---|---|---|
| ~~`--color-bg` sobre `--color-accent`~~ | ~~3,12:1~~ | ✅ **resolvido** — o CTA passa a usar `--color-accent-700` (5,02:1). Ver abaixo. |
| ~~Branco sobre `--color-accent`~~ | ~~3,64:1~~ | ✅ **resolvido** — botões e toasts sólidos usam `accent-700`; iniciais de avatar usam `accent-100` + `accent-700`. |
| `--color-accent` / bg | 3,12:1 | aceitável como elemento **gráfico** (mín. 3:1): FAB, linha de horário. Nunca como texto. |
| `--color-accent-600` / bg | 3,95:1 | idem — gráfico sim, texto não. |
| `#4f8a5b` / bg | 3,53:1 | ponto de estado. Ok como gráfico, reprova como texto. |
| `--color-divider` / bg | **1,32:1** | decorativo. **Não pode ser o único delimitador de um controle.** |

### ✅ Superfícies sólidas com texto — resolvido em 03/08/2026

O botão primário usava `--color-accent` de fundo com `--color-bg` de texto:
**3,12:1**. Era a falha de contraste mais séria do produto.

**Decisão aprovada:** toda superfície sólida que carrega texto usa
`--color-accent-700` (`#8a5a34`) de fundo com texto claro — **5,02:1**, aprova AA
sem sair da paleta.

| Superfície | Fundo | Texto |
|---|---|---|
| Botão primário | `--color-accent-700` | `--color-bg` |
| Toast sólido | `--color-accent-700` | `--color-bg` |
| **Avatar com iniciais** | `--color-accent-100` | `--color-accent-700` | 

O avatar segue uma regra própria, também aprovada: em vez de inverter para
sólido escuro, usa o par tingido — mais leve e coerente com o resto da
linguagem.

⚠ **Duas consequências medidas, que precisam de decisão complementar:**

1. **`#8a5a34` sobre `#ecdcc9` = 4,36:1.** Melhor que os 3,64:1 anteriores, mas
   **3% abaixo do mínimo de 4,5:1** para as iniciais de 13px em negrito do
   avatar de 40px. No avatar de 72px, cujas iniciais são maiores, o limiar cai
   para 3:1 e a combinação passa com folga.
   **Opções:** (a) aceitar como exceção registrada, já que é uma melhora clara
   sobre o estado atual; (b) usar `--color-text` nas iniciais — 11,37:1, muito
   legível, mas sem o caramelo. **PENDENTE — ver §21 P9.**
2. **O círculo tingido quase desaparece:** `#ecdcc9` contra o fundo tem
   **1,15:1** e contra a superfície de cartão, 1,20:1. As iniciais passam a
   flutuar sem forma visível em volta.
   **Proposta:** borda de 1px em `--color-divider` no avatar tingido, para a
   forma voltar a existir. **PENDENTE — ver §21 P10.**

**`--color-accent` continua existindo** e permanece a cor da marca. O que muda é
só o papel: ela é cor **gráfica e decorativa**, não fundo de texto pequeno.

| `--color-accent` **pode** | `--color-accent` **não pode** |
|---|---|
| FAB, ícone, ponto de estado | fundo de botão com rótulo |
| linha do horário atual | fundo de toast |
| barra e série de gráfico | fundo de badge com texto |
| fundo tingido sem texto por cima | qualquer texto pequeno por cima |

**Alternativas descartadas:** clarear o texto (piora), borda escura (não resolve
o texto), criar um caramelo novo (introduziria cor fora da paleta).

### Regras permanentes de contraste

1. Texto normal: mínimo 4,5:1. Texto ≥ 24px ou ≥ 19px negrito: mínimo 3:1.
2. Elemento gráfico que carrega significado (ícone, ponto, linha): mínimo 3:1.
3. `--color-accent` e `--color-accent-600` **não são cores de texto sobre fundo
   claro, nem fundo de superfície com texto.** Para texto, use
   `--color-accent-700`; para superfície sólida com rótulo, também
   `--color-accent-700`.
4. Cor de estado em texto sobre fundo tingido usa sempre a variante `-700`.
5. Toda combinação nova é medida antes de entrar. Estimativa não vale.

---

## 7. Tipografia

| Papel | Token | Valor |
|---|---|---|
| Títulos | `--font-heading` | `"Poppins", "Jost", system-ui, sans-serif` |
| Corpo | `--font-body` | `"Jost", system-ui, sans-serif` |

**Pesos carregados no aplicativo:** Poppins 500/600/700 · Jost 400/500/600/700.

**Pesos em uso:** 700 (54×), 600 (40×), 500 (5×), 300 (1×).

⚠ **Bug conhecido:** existe um uso de `font-weight: 300` no painel, mas Jost 300
não é carregado ali (só na landing). O navegador sintetiza ou cai em 400.
Correção: usar 400, ou carregar o peso. **P2.**

⚠ **Correção do documento anterior:** a versão provisória pedia peso **650** para
`title-2`. Esse peso não existe em Poppins. **O valor oficial é 600.**

### ✅ Landing × aplicativo — resolvido em 03/08/2026

A landing carrega ainda `Cormorant Garamond` (face de display, 12+ usos) e
`Inter`. O aplicativo não carrega nenhuma das duas.

**Decisão aprovada: a diferença é intencional e permanece.**

| | Fontes |
|---|---|
| **Landing pública** | Poppins · Jost · **Cormorant Garamond** (recurso editorial) · Inter |
| **Aplicativo** | Poppins (títulos) · Jost (corpo, rótulos, controles) |

**Não carregar Cormorant nem Inter no painel apenas por consistência com a
landing.** A landing é expressão de marca; o aplicativo é clareza operacional.
São públicos e momentos diferentes.

---

## 8. Hierarquia tipográfica

**Esta é a escala real do produto, não uma escala ideal.** O aplicativo opera
entre 11 e 15px porque é denso de informação em tela pequena — o corpo de 16px
do documento provisório não corresponde ao produto e foi descartado.

| Token | Tamanho / peso | Fonte | Uso |
|---|---|---|---|
| `--text-display` | 26 / 700 | heading | número de destaque, nome no perfil |
| `--text-title-1` | 24 / 600 | heading | saudação do cabeçalho |
| `--text-title-2` | 20 / 700 | heading | título de seção grande |
| `--text-title-3` | 17 / 600 | heading | título de bloco |
| `--text-body` | 15 / 400 | body | texto de leitura, campos |
| `--text-body-strong` | 15 / 600 | body | rótulo com peso |
| `--text-caption` | 13 / 400 | body | metadado, legenda — **o tamanho mais usado** |
| `--text-micro` | 11 / 700 | body | badge, rótulo de aba |

### Situação atual e regra de migração

O painel usa hoje **23 tamanhos distintos**, incluindo meios-pixels
(9,5 / 10,5 / 11,5 / 12,5 / 13,5 / 14,5) em 47 ocorrências.

**Regra:** todo tamanho novo usa a escala de 8 degraus acima. Os meios-pixels
existentes migram para o degrau mais próximo, **um componente por vez**, junto
com a migração daquele componente — nunca em um passe global, que seria uma
mudança visual ampla sem revisão.

**Nunca:** criar tamanho intermediário novo, usar meio-pixel, ou usar peso fora
de 400/500/600/700.

**Números que mudam na tela** (relógio, contadores) usam
`font-variant-numeric: tabular-nums`, para não "tremer" a cada atualização.

---

## 9. Espaçamento

Escala oficial, derivada dos valores realmente usados no código.

| Token | Valor | Uso típico |
|---|---|---|
| `--space-1` | 4px | separação mínima ícone/texto |
| `--space-2` | 8px | itens da mesma família |
| `--space-2-5` | 10px | ⚠ fora da escala do doc anterior — 14 usos reais |
| `--space-3` | 12px | espaçamento interno mais comum |
| `--space-3-5` | 14px | ⚠ fora da escala do doc anterior — ~10 usos reais |
| `--space-4` | 16px | padding de cartão |
| `--space-5` | 20px | **gutter da tela** |
| `--space-6` | 24px | respiro do cabeçalho |
| `--space-8` | 32px | separação entre seções de assunto |

**Decisão:** `10px` e `14px` **ficam na escala**. O documento provisório os
excluía, mas são dois dos valores mais usados do produto. Removê-los seria
reescrever espaçamento em dezenas de lugares por conformidade com um número
que não veio do produto.

**Depreciados** (migrar quando o componente for tocado): 2, 3, 5, 6, 7, 9px.
Exceção legítima: 2px em separação óptica de ícone.

**Regra:** espaço grande separa assuntos diferentes; espaço pequeno agrupa
iguais. Uma tela com um único valor de espaçamento não tem hierarquia
([02 §3](02_DESIGN_PRINCIPLES.md)).

---

## 10. Grid e gutters

- **Sem sistema de colunas.** O produto é uma coluna única de blocos empilhados.
- **Gutter lateral: 20px** — valor real do produto. O documento provisório dizia
  24px; **corrigido para 20px.** Alterar reflui todas as telas.
- **Largura do canvas: 480px.** Já é o valor no código.
- **Largura de referência de desenho: 390px.** Validar em 320, 390 e 430.
- Grades internas (resumo de estoque, métricas) usam `grid` com colunas iguais
  e colapsam para menos colunas abaixo de 360px.

---

## 11. Raios

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 12px | chip, campo pequeno, ícone-container |
| `--radius-md` | **16px** | **raio canônico de cartão** — 16 usos, já consolidado |
| `--radius-lg` | 20px | cartão grande, painel de destaque |
| `--radius-xl` | 28px | folha inferior, superfície grande |
| `--radius-full` | 999px | pílula, botão, badge — 32 usos |
| `--radius-circle` | 50% | avatar, botão circular — 23 usos |

### Situação atual

O painel usa **15 valores distintos**. `16px`, `999px` e `50%` já são canônicos.
Fora da escala: `22px` (4×), `18px` (1×), `14px` (5×), `13px` (2×), `12px` (4×),
`11px` (2×), `10px` (2×), `24px`, `8px`, `3px`, `2px`.

### ✅ Convergência aprovada em 03/08/2026

| De | Para | Afeta |
|---|---|---|
| 18px | **16px** | `.insight-card` |
| 22px | **20px** | `.perf-card`, `.panorama-card`, `.history-card`, `.home-hero-card` |
| 14px | **12px** | `.action-row` e paddings de controle |
| 13px | **12px** | controles compactos |
| 11px | **12px** | ver nota abaixo |

**Semântica oficial da escala:**
12px controles e superfícies compactas · 16px cards e componentes padrão ·
20px cards de maior destaque · 28px folhas inferiores e modais grandes ·
999px pílulas, avatares e elementos circulares.

⚠ **Nota sobre o 11px.** A decisão previa "12px ou 10px, conforme o
componente", mas a escala oficial aprovada **não inclui 10px**. Para não
reabrir um degrau que a própria decisão fechou, **os dois usos de 11px vão para
12px**. Se algum caso concreto exigir 10px, ele volta como proposta de extensão
da escala, não como exceção local.

⚠ **Substituição cega global está proibida.** A migração é componente por
componente, junto com a migração daquele componente
([08 §13](08_IMPLEMENTATION_RULES.md)). Cada passo é comparado lado a lado com
o anterior.

⚠ `agendar.html` define `--radius-sm/md/lg` (8/16/28px) e **não usa nenhum**.
São tokens mortos com valores que não batem com esta escala. Remover na
migração.

---

## 12. Bordas

| Token | Valor | Uso |
|---|---|---|
| `--border-width` | 1px | padrão de cartão, campo e folha — 34 usos |
| `--border-width-emphasis` | 1,5px | item selecionado, estado crítico — 5 usos |

**Cor padrão:** `--color-divider`.
**Cor enfática:** `--color-neutral-300` ou a cor do estado.

**Depreciados:** 2px e 3px (4 usos cada). O 3px sobrevive apenas como anel de
foco, que é elevação, não borda — ver §13.

**Regra:** borda é o método padrão de separar superfícies. Sombra é exceção.

---

## 13. Elevação e sombras

⚠ **Estado atual quebrado.** `painel.html` referencia `var(--shadow-md, …)` mas
**não define `--shadow-md`**. O valor de recuo é que vale sempre — e são **dois
recuos diferentes**: `rgba(0,0,0,0.18)` no FAB e `rgba(0,0,0,0.12)` no botão
"Hoje". Dois botões lado a lado, sombras diferentes por acidente. Corrigir isto
é tokenização, não mudança de identidade.

Escala oficial:

| Token | Valor | Uso |
|---|---|---|
| `--elevation-raised` | `0 3px 10px rgba(43,36,32,0.16)` | FAB, botão flutuante |
| `--elevation-hover` | `0 8px 20px rgba(43,36,32,0.07)` | resposta a toque/hover em cartão |
| `--elevation-overlay` | `0 20px 60px rgba(0,0,0,0.25)` | modal, folha inferior |
| `--focus-ring` | `0 0 0 3px var(--color-accent-100)` | foco de teclado |

Hoje existem **três receitas diferentes** para o mesmo efeito de hover
(`0 8px 20px 0.07`, `0 8px 18px 0.06`, `0 10px 24px 0.08`). Convergem para
`--elevation-hover`.

**Regras.**
1. Sombra só em superfície que realmente flutua sobre outra.
2. Cartão em fluxo normal usa borda, nunca sombra estática.
3. Nenhuma sombra colorida, nem brilho, nem sombra interna decorativa.
4. Máximo de dois níveis de elevação visíveis ao mesmo tempo.

---

## 14. Ícones

**Sistema já correto e consolidado.** Preservar.

| Item | Valor |
|---|---|
| Origem | objeto `ICONS` no JS, SVG inline (~37 ícones) |
| Estilo | traço, sem preenchimento |
| Espessura | **1,6px** |
| Cor | `currentColor` — herda do container, sem JS para estado ativo |
| Tamanho padrão | 21px na barra de navegação, 13–17px em linha com texto |

**Regras.**
1. Todo ícone entra no `ICONS`. Nenhum SVG solto no markup.
2. Traço 1,6px, sem exceção. Ícone importado é redesenhado.
3. **Todo container de ícone declara `width` e `height`.** Um SVG dentro de um
   container sem regra de tamanho renderiza no tamanho nativo — já produziu um
   "ícone de gota gigante" em produção.
4. Ícone nunca é o único portador de significado — sempre com rótulo ou
   `aria-label`.
5. `star` e `starFilled` são o único par outline/preenchido que convive: outline
   = não marcado, preenchido = marcado. Intencional.

⚠ **Pendência:** restam 27 pictogramas/emoji no painel (`📈 📉 🔥 ❄ ➖ 🗑 ⇄`).
Substituir por `ICONS`. **P2.**

---

## 15. Imagens e avatares

**Avatar.**
- Sempre `--radius-circle`.
- Tamanhos: 40px (lista), 72px (perfil).
- **Sem foto: iniciais em `--color-accent-700` sobre `--color-accent-100`**
  (decisão de 03/08/2026, substitui o branco sobre caramelo). Ver as duas
  ressalvas medidas em §6.
- Selo sobreposto no canto (VIP) usa `--color-accent-700` — **nunca**
  `--color-accent-2`, reservado a alerta.

**Fotos de conteúdo** (cabelo, produto).

**✅ Padrão mobile oficial, aprovado em 03/08/2026: galeria horizontal.**

| Regra | Valor |
|---|---|
| Miniatura | **96–112px** |
| Raio | `--radius-sm` (12px) |
| Rolagem | horizontal, com encaixe suave |
| Botão "Adicionar foto" | ao final da faixa |
| Toque | abre visualização ampliada |
| Contagem | no título da seção |
| Zero fotos | estado vazio convidativo |

**Grade só é permitida em:** visualização ampliada, futura interface desktop, ou
página dedicada de galeria. **Nas fichas mobile, sempre rolagem horizontal.**

- Toda imagem tem `alt` descritivo. Decorativa recebe `alt=""`.

⚠ **Convergência necessária:** o detalhe de atendimento ainda usa a grade antiga.
Migra para a galeria horizontal — ver [04](04_COMPONENT_LIBRARY.md) e
[09 §21](09_UX_PATTERNS.md).

---

## 16. Layout mobile

| Regra | Valor |
|---|---|
| Faixa suportada | 320–430px |
| Largura de referência | 390px |
| Validação obrigatória | 320, 390 e 430px |
| Canvas | 480px de largura máxima |
| Gutter | 20px |
| Alvo de toque | mínimo 44×44px |
| Barra inferior | fixa; conteúdo recebe `padding-bottom` equivalente |
| Botões flutuantes | 100px do rodapé (acima da barra de navegação) |

**Anatomia padrão de tela** (ver [09](09_UX_PATTERNS.md)):
cabeçalho → resumo operacional (quando útil) → busca e filtros → conteúdo →
uma ação primária → barra inferior nos destinos de primeiro nível.

---

## 17. Comportamento no navegador desktop

**Regra:** em telas largas, o aplicativo é a mesma coluna de 480px,
**centralizada e completa**. Não é uma versão desktop. Não estica.

Isso inclui obrigatoriamente:
- o conteúdo principal ✅ (já correto);
- o **cabeçalho** ❌ (hoje sem largura máxima — cola na esquerda);
- a **barra de navegação inferior** ❌ (hoje atravessa a janela inteira);
- os **botões flutuantes** ❌ (hoje colados nas bordas da janela).

**Padrão de solução:** um container único que envolve tudo. O padrão correto já
existe no código, no modo tela cheia do questionário: posição fixa,
`left: 50%`, deslocamento de metade da largura, `max-width: 480px`.

**Status: P0 técnico.** É a violação mais direta do contrato de UI.
Implementação em [08 §14](08_IMPLEMENTATION_RULES.md).

### ✅ Laterais do canvas — resolvido em 03/08/2026

```
viewport
┌──────────────────────────────────────┐
│         fundo neutro do app          │
│       ┌──────────────────────┐       │
│       │ canvas mobile 480px  │       │
│       └──────────────────────┘       │
└──────────────────────────────────────┘
```

| Regra | |
|---|---|
| Canvas | centralizado, máximo 480px |
| Fundo lateral | `--color-bg` |
| Conteúdo lateral | **nenhum** — nada operacional fora do canvas |
| Header, main, barra inferior, FAB e sobreposições | limitados ao mesmo canvas |
| Moldura de celular simulada | **proibida** |
| Padrão, imagem ou decoração lateral | **proibidos** |

⚠ **Consequência aceita:** como as laterais e o canvas usam o mesmo
`--color-bg`, a fronteira dos 480px fica **invisível** em tela larga — o
aplicativo aparece como uma coluna de conteúdo centralizada, sem moldura. É
exatamente o que a decisão pede ("não simular um celular"), mas fica registrado
para que ninguém interprete depois como defeito de implementação.

---

## 18. Safe areas

⚠ **Nenhum tratamento de área segura existe no projeto hoje.** Zero ocorrências.

A barra inferior usa um valor fixo de 20px de padding inferior — um chute que
funciona por acaso na maioria dos aparelhos.

**Regra oficial:**
- Barra inferior e botões flutuantes somam a área segura inferior ao seu
  espaçamento.
- O `padding-bottom` do corpo acompanha a altura real da barra mais a área
  segura.
- Folhas inferiores respeitam a área segura no seu fim.

**Status: P1.** Detalhe em [07 §15](07_ACCESSIBILITY.md).

---

## 19. Responsividade

**Estado atual:** o painel tem **um único ponto de quebra**, em 360px, que
colapsa grades de duas colunas para uma. Entre 361 e 430px nada se adapta.

**Pontos de quebra oficiais:**

| Ponto | Comportamento |
|---|---|
| ≤ 360px | grades de 2+ colunas colapsam; espaçamento reduz um degrau |
| 361–480px | layout padrão |
| > 480px | canvas centralizado de 480px (§17) |

**Regras.**
1. Nada de largura fixa em elemento de conteúdo. Cartão ocupa a largura
   disponível.
2. Texto longo quebra; nunca corta sem indicação.
3. Faixas horizontais (chips, galeria) rolam — não quebram em linha.
4. Suportar zoom de texto até 200% sem perda de função. **PENDENTE: nunca
   testado.**

---

## 20. Regras proibidas

Vetos permanentes. Violação é motivo de reprovação em revisão.

**Cor**
1. Nenhum hex literal em componente. Só token.
2. Nenhuma cor fora da paleta desta página.
3. **Nenhum amarelo.** O degrau de atenção é o caramelo.
4. `--color-accent-2` só em alerta — nunca em paleta decorativa ou de categoria.
5. Nenhum gradiente. Nenhuma cor neon, saturada ou fria.
6. Nenhum tema escuro.

**Forma**
7. Nenhum raio fora da escala da §11.
8. Nenhuma sombra fora da escala da §13. Nenhuma sombra colorida ou brilho.
9. Nenhuma borda acima de 1,5px, exceto anel de foco.
10. Nenhum cartão dentro de cartão.

**Tipografia**
11. Nenhuma família além de Poppins e Jost no aplicativo.
12. Nenhum peso fora de 400/500/600/700.
13. Nenhum tamanho fora da escala. Nenhum meio-pixel novo.
14. Nenhum `text-transform: capitalize` em texto com preposição — maiusculiza
    palavra por palavra e produz "Agosto **De** 2026". Maiusculize só a primeira
    letra, no código.

**Layout**
15. Nenhum layout desktop-first no aplicativo.
16. Nenhum alvo de toque abaixo de 44×44px, nem com área estendida invisível
    ausente.
17. Nenhum elemento fixo colado na borda da janela em vez da borda do canvas.

**Movimento**
18. Nenhuma duração fora da escala de [05](05_MOTION_SYSTEM.md).
19. Nenhuma animação decorativa, contínua ou de mais de 350ms em transição
    rotineira.
20. Nenhuma animação sem caminho de limpeza independente do evento de término.

---

## 21. Decisões pendentes

### ✅ Resolvidas em 03/08/2026

| # | Assunto | Decisão |
|---|---|---|
| ~~P1~~ | Contraste do CTA primário | fundo `--color-accent-700` (5,02:1) — §6 |
| ~~P2~~ | Convergência de raios | aprovada: 18→16, 22→20, 14/13/11→12 — §11 |
| ~~P3~~ | Cormorant Garamond | exclusiva da landing; não entra no aplicativo — §7 |
| ~~P4~~ | Branco sobre caramelo | resolvido por contexto: sólidos em `accent-700`, avatar em `accent-100`/`accent-700` — §6 |
| ~~P6~~ | Fundo do desktop | `--color-bg` liso, sem moldura nem decoração — §17 |

### Em aberto

| # | Assunto | Detalhe | Bloqueia |
|---|---|---|---|
| **P5** | **Nomenclatura da landing** | Unificar `--ink`/`--paper` com `--color-*`. Mesmos hexes, só nome. | P2 técnico |
| **P7** | **Zoom de texto 200%** | Nunca testado. Pode revelar quebras. | §19 |
| **P8** | **Vocabulário configurável** | Registrado como evolução futura: mantém-se o vocabulário de salão, **evitando hardcode novo onde um rótulo configurável for igualmente barato**. Não construir ainda o sistema completo de terminologia dinâmica. **Não bloqueia o Design System.** | — |
| **P9** | **Iniciais do avatar a 4,36:1** | 3% abaixo do mínimo no avatar de 40px. Aceitar como exceção registrada, ou usar `--color-text` (11,37:1) e abrir mão do caramelo. | AA |
| **P10** | **Forma do avatar tingido** | O círculo `accent-100` tem 1,15:1 contra o fundo e some. Proposta: borda de 1px em `--color-divider`. | §15 |
| **P11** | **Questionário multilíngue** | Backlog. Não bloqueia. O código novo apenas não pode criar estruturas que impossibilitem internacionalização — regras em [06 §26](06_CONTENT_GUIDELINES.md). | — |

**P9 e P10 nasceram da própria decisão de 03/08** e são consequências medidas,
não objeções. **P5 e P7 continuam abertas. P8 e P11 estão explicitamente no
backlog e não travam a implementação.**

---

## Correções aplicadas ao documento provisório

| O que dizia | O que é verdade |
|---|---|
| `bg.canvas #F5EFE6` | `#f3ede4` |
| `bg.surface #FBF7F1` | `#f7f1e8` |
| `text.primary #241C18` | `#2b2420` |
| `text.secondary #766A60` | `#6b6053` |
| `border.subtle #DED3C5` | `rgba(43,36,32,0.14)` |
| `action.primary #A85F2A` | `#b6784a` |
| `action.secondary #C17A42` | `#a1683f` / `#8a5a34` |
| `status.success #4B9B62` (um valor) | `#4f8a5b` gráfico + `#3b6744` texto |
| `status.warning #D99318` (amarelo) | **não existe** — o degrau de atenção é o caramelo |
| `status.critical #BD3B3B` | `#b23a3a` |
| `status.neutral #9B9B96` | `#6b6053` |
| `title-2` peso 650 | 600 (650 não existe em Poppins) |
| `body` 16/24 | 15/400 — o produto opera em 11–15px |
| Gutter 24px | **20px** |
| `radius-sm` 10px | 12px |
| Escala de espaço sem 10 e 14 | 10 e 14 **fazem parte** da escala |
| `src/design-system/` | não aplicável — o projeto não tem build. Ver [08](08_IMPLEMENTATION_RULES.md) |

---

**Próximo documento:** [04 — Component Library](04_COMPONENT_LIBRARY.md).
