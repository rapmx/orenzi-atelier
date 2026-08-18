# 10 — Governance e Changelog

**Versão 1.0 · 03/08/2026**

Como o sistema evolui sem perder coerência.

---

## 1. Fonte de verdade

**O código é a fonte de verdade da identidade visual. Estes documentos são a
fonte de verdade das regras.**

Isso não é uma contradição, é uma divisão de papéis:

| Pergunta | Onde está a resposta |
|---|---|
| "Qual é o caramelo do Orenzi?" | o código — `#b6784a`, no `:root` |
| "Onde o caramelo pode ser usado?" | [03 §4](03_DESIGN_SYSTEM.md) |
| "Qual é o raio do card?" | o código — 16px, já consolidado |
| "Posso criar um raio de 22px?" | [03 §11](03_DESIGN_SYSTEM.md) — não |

**Regra fundadora, decidida em 03/08/2026:** quando um documento e o código
divergem em um **valor**, o código vence e o documento se corrige. Quando
divergem em uma **regra**, o documento vence e o código se corrige.

Foi assim que a versão provisória do Design System foi substituída: ela propunha
`#F5EFE6` para o fundo enquanto o produto usava `#f3ede4`. Corrigimos o
documento, não o produto.

---

## 2. Hierarquia dos documentos

Em caso de conflito, vale o de número menor:

```
01 Product Language      ← o que o Orenzi é. Vence tudo.
02 Design Principles     ← como decidir.
03 Design System         ← quais valores.
04 Component Library     ← quais componentes.
05 Motion System         ← como se move.
06 Content Guidelines    ← como escreve.
07 Accessibility         ← mínimos inegociáveis.
09 UX Patterns           ← soluções recorrentes.
08 Implementation Rules  ← como implementar.
10 Governance            ← como mudar tudo acima.
```

**Duas exceções à hierarquia:**
- **[07 — Accessibility](07_ACCESSIBILITY.md) tem veto.** Uma solução que
  reprova acessibilidade não é aprovada por ser bonita ou por seguir um
  princípio de altura maior.
- **Preservação de backend, banco, rotas e regra de negócio tem veto absoluto.**
  Nenhuma mudança visual justifica tocar em lógica de domínio.

Documentos anteriores a esta versão (`ORENZI_DESIGN_SYSTEM_v1.0.md`) estão
**substituídos** e não devem ser consultados como referência.

---

## 3. Como propor um novo token

**Antes:** procure em [03](03_DESIGN_SYSTEM.md). A maioria dos pedidos de token
novo é um token existente com outro nome.

**Proposta precisa conter:**
1. Nome seguindo a convenção de [03 §2](03_DESIGN_SYSTEM.md).
2. Valor exato.
3. Papel semântico — o que ele significa, não como parece.
4. Por que nenhum token existente serve.
5. Onde será usado (pelo menos dois lugares — um lugar só é valor local).
6. Se for cor: **razão de contraste medida** contra fundo e superfície.

**Aprovação:** dono do produto.

**Rejeição automática:**
- token de instância (`--radius-do-card-de-cliente`);
- nome pela aparência (`--marrom-claro`);
- cor fora da paleta de [03 §3](03_DESIGN_SYSTEM.md);
- amarelo, em qualquer circunstância;
- token com um único uso.

---

## 4. Como propor um novo componente

**Antes:** confira a tabela de convergência de
[04](04_COMPONENT_LIBRARY.md#mapa-de-convergência--resumo). O componente pode já
existir com outro nome.

**Proposta precisa conter:**
1. Os 13 campos do formato de [04](04_COMPONENT_LIBRARY.md).
2. Por que nenhum existente resolve, nem com variante.
3. Nível (primitivo, produto ou padrão composto).
4. Quais implementações atuais devem convergir para ele.
5. Rascunho no showcase, com todos os estados.

**Aprovação:** dono do produto.

**Rejeição automática:**
- duplica um existente com diferença estética;
- introduz valor visual que não é token;
- não tem estados de foco, desabilitado e carregando definidos;
- é primitivo com regra de domínio dentro.

---

## 5. Como propor uma variante

Variante é mais barata que componente e deve ser a primeira tentativa.

**Proposta:**
1. Componente base.
2. O que muda — e só o que muda.
3. Por que é variante e não uso do existente.
4. Quantos lugares vão usá-la.

**Aprovação:** dono do produto, mas com barra mais baixa que componente novo.

**Limite:** mais de 4 variantes de um componente indica que ele está fazendo
coisas demais. Nesse ponto, revisar o componente inteiro.

---

## 6. Quando criar um padrão

Um padrão entra em [09](09_UX_PATTERNS.md) quando:

- o problema apareceu **três vezes** em contextos diferentes; **ou**
- duas telas já o resolveram de formas diferentes (aí o padrão é a
  reconciliação); **ou**
- é um problema que vai aparecer em todo módulo futuro (busca, vazio, erro).

**Não crie padrão para:** caso único, problema hipotético, ou "para o caso de
precisarmos".

---

## 7. Como registrar exceções

Exceção é uma violação **consciente e temporária** de uma regra.

**Formato obrigatório, no próprio código:**

```
/* EXCEÇÃO DS — <regra violada>
   Motivo: <por que não dá para seguir>
   Prazo: <quando será resolvida, ou o que destrava>
   Aprovado por: <quem> em <data> */
```

**Regras.**
1. Toda exceção tem prazo ou condição de saída. Sem isso, não é exceção — é uma
   regra nova mal declarada.
2. Exceção sem aprovação registrada é defeito, não exceção.
3. **[07 — Accessibility](07_ACCESSIBILITY.md) não admite exceção.**
4. Exceção que sobrevive a três meses vira proposta de mudança de regra ou é
   removida.

**Exceções vivas hoje** (herdadas, ainda não formalizadas):

| Exceção | Motivo | Saída |
|---|---|---|
| `--color-neutral-100` = `--color-surface` | markup antigo depende do nome | remover ao migrar `.card` e `.action-row` |
| Contraste do CTA a 3,12:1 | correção muda a identidade percebida | decisão P1 de [03 §21](03_DESIGN_SYSTEM.md) |
| 23 tamanhos tipográficos | migração global sem revisão seria arriscada | migram com cada componente |
| CSS duplicado entre painel e demo | o demo precisa rodar sem Supabase | permanece — é da natureza do arquivo |

---

## 8. Processo de revisão

**Toda mudança visual passa por três perguntas, nesta ordem:**

1. **Parece Orenzi?** — critérios de
   [01 §11](01_PRODUCT_LANGUAGE.md#11-critérios-para-avaliar-se-algo-parece-orenzi).
2. **Segue os princípios?** — checklist de
   [02](02_DESIGN_PRINCIPLES.md#uso-em-revisão).
3. **Está implementável sem exceção?** — [03](03_DESIGN_SYSTEM.md),
   [04](04_COMPONENT_LIBRARY.md), [07](07_ACCESSIBILITY.md).

Um "não" em qualquer uma é bloqueio, não sugestão.

**Quem revisa.** O dono do produto revisa identidade e escopo. Quem implementa
revisa conformidade técnica. Não são a mesma revisão e não acontecem no mesmo
momento.

**O que exige aprovação prévia** (lista completa em
[08 §23](08_IMPLEMENTATION_RULES.md)): qualquer alteração de valor visual,
qualquer componente novo, qualquer estrutura de arquivo nova, qualquer decisão
pendente de [03 §21](03_DESIGN_SYSTEM.md).

**O que não exige.** Corrigir uma violação declarada destes documentos —
tokenizar um valor literal, associar um rótulo a um campo, adicionar um
`aria-label` faltante. Isso é dívida documentada, não decisão nova.

---

## 9. Definition of Done

Os três níveis são cumulativos.

**Produto** ([02](02_DESIGN_PRINCIPLES.md))
- [ ] Uma ação primária clara
- [ ] Calmo quando está tudo normal
- [ ] Todo número rastreável a dado real
- [ ] Contexto preservado ao voltar
- [ ] Vazio, sem resultado, erro e carregando tratados

**Design** ([03](03_DESIGN_SYSTEM.md), [04](04_COMPONENT_LIBRARY.md),
[05](05_MOTION_SYSTEM.md), [06](06_CONTENT_GUIDELINES.md))
- [ ] Só tokens; nenhum valor literal
- [ ] Só componentes da biblioteca
- [ ] Movimento dentro da escala
- [ ] Texto conforme os termos oficiais
- [ ] 320 / 390 / 430px verificados
- [ ] Desktop centraliza o canvas

**Técnico** ([07](07_ACCESSIBILITY.md), [08](08_IMPLEMENTATION_RULES.md))
- [ ] Checklist de acessibilidade cumprido
- [ ] Painel e demo espelhados
- [ ] Console sem erro novo
- [ ] Comparação lado a lado sem diferença não intencional
- [ ] Commit e push feitos

⚠ **O commit não é burocracia.** Este projeto já perdeu trabalho por sobrescrita
entre sessões — é a razão de o git existir aqui.

---

## 10. Versionamento

Versão semântica aplicada à **documentação e ao sistema visual**, não ao
produto:

```
MAJOR.MINOR.PATCH        exemplo: 1.2.0
```

A versão vive no cabeçalho de cada documento e no changelog desta página.
Documentos podem estar em versões diferentes; o changelog é único.

---

## 11. Patch

**Muda:** correção de texto, exemplo, erro de digitação, esclarecimento de regra
já existente, correção de valor documentado que diverge do código.

**Não muda:** nenhuma decisão. Ninguém precisa reagir a um patch.

**Aprovação:** não precisa.

**Exemplo:** corrigir no documento que a janela desenhada da agenda é 5h–22h, e
não 5h–21h.

---

## 12. Minor

**Muda:** token novo, componente novo, variante nova, padrão novo, regra nova que
não invalida nada existente.

**Efeito:** código existente continua válido. A novidade é adotada quando cada
componente for tocado.

**Aprovação:** dono do produto.

**Exemplo:** adicionar `Banner` à biblioteca; promover o verde a token.

---

## 13. Major

**Muda:** qualquer coisa que invalide implementação existente — valor de token
alterado, componente removido, regra que passa a proibir o que era permitido,
mudança de identidade.

**Efeito:** exige plano de migração e prazo. Nunca entra sem ele.

**Aprovação:** dono do produto, **explicitamente**, com o impacto quantificado.

**Exemplos:** trocar o fundo do CTA para `--color-accent-700`; convergir os
raios de card; eliminar a caixa alta do botão da página de agendamento.

**Nenhuma mudança major pode ser tomada dentro de uma sessão de implementação.**

---

## 14. Depreciação

Nada é removido de uma vez.

1. **Marcar.** Comentário no código e nota no documento: o que substitui e por
   quê.
2. **Alias temporário**, quando possível, para o código antigo continuar
   funcionando.
3. **Migrar** ocorrência por ocorrência, junto com o componente.
4. **Remover** quando não houver mais uso, e registrar no changelog.

**Regra:** nada some sem substituto documentado.

**Depreciados hoje:**

| Item | Substituto | Etapa |
|---|---|---|
| `--color-neutral-100` | `--color-surface` | 2 — alias |
| `--radius-sm/md/lg` de `agendar.html` | escala de [03 §11](03_DESIGN_SYSTEM.md) | 1 — marcado (nunca foi usado) |
| `--shadow-sm/md` | `--elevation-*` | 1 — marcado |
| `.btn-see-more` | `Button ghost` com chevron | 1 — marcado |
| Espaçamentos de 2, 3, 5, 6, 7 e 9px | escala de [03 §9](03_DESIGN_SYSTEM.md) | 1 — marcado |
| Emojis como ícone | `ICONS` | 1 — marcado |
| Valores de recuo verdes em `.tag-accent-2` | remover | 1 — marcado |

---

## 15. Migração

Toda mudança major vem com um plano contendo:

1. **Escopo** — quantos arquivos, quantas ocorrências, contadas de verdade.
2. **Ordem** — o que primeiro e por quê.
3. **Reversibilidade** — como voltar atrás se der errado.
4. **Verificação** — como saber que não quebrou.
5. **Prazo ou condição de conclusão.**

**Regras.**
- Uma migração por vez. Duas em paralelo produzem conflito entre sessões.
- Migração parcial é aceitável **se estiver registrada** — migração parcial
  esquecida é como o produto ganha dois padrões.
- Toda migração de tela entra em `painel.html` **e** `painel_demo.html`.

Ordem completa em [08 §19](08_IMPLEMENTATION_RULES.md).

---

## 16. Responsáveis

| Papel | Responsabilidade |
|---|---|
| **Dono do produto (Raphael)** | identidade, escopo, prioridade, aprovação de todo major e de todo token, componente ou arquivo novo |
| **Cliente (Juliane)** | validação de uso real; veto sobre o que atrapalha o trabalho — foi assim que o tema escuro foi recusado |
| **Quem implementa (incluindo Claude)** | conformidade com estes documentos; **propor, nunca decidir** o que está marcado como pendente |

**Regra para agentes de IA:** ao encontrar uma decisão pendente, **pare e
pergunte**. Não escolha o valor mais provável. Um valor inventado que entra no
código vira identidade por inércia.

---

## 17. Registro de decisões

Toda decisão que muda uma regra vira um **ADR** (registro de decisão de
arquitetura).

> ⚠ **A casa dos ADRs mudou em 15/08/2026.** Eles vivem em
> **`vault/03 - Decisions/`**, não em `/docs/adr/` — essa pasta foi
> especificada aqui mas **nunca chegou a ser criada**, e o rationale do projeto
> passou a morar no vault. **Não criar `/docs/adr/`:** duas casas de ADR é como
> se perde ADR. Índice em `vault/03 - Decisions/ADR Index.md`.
>
> O **template** (§19 abaixo) continua sendo o oficial e não mudou.

**Merece ADR:** mudança de token, adoção ou recusa de padrão, mudança de
arquitetura, recusa consciente de uma prática comum.

**Não merece:** escolha de implementação sem efeito sobre a regra.

### Decisões deste documento, e onde estão hoje

Os ADRs retroativos foram **escritos em 15/08/2026**, no vault. Esta tabela
vira ponteiro:

| # | Decisão | Data | ADR |
|---|---|---|---|
| 1 | Tema escuro recusado pela cliente | anterior a 08/2026 | `ADR 0001` |
| 2 | Sem build, sem framework, sem npm — decisão deliberada | anterior a 08/2026 | `ADR 0002` |
| 3 | ~~Sem grafo de código~~ | 02/08/2026 | ⚠ **revertida** — ver abaixo |
| 4 | Cor do atendimento por categoria de serviço, não por profissional | 02/08/2026 | `ADR 0004` |
| 5 | Sem amarelo; o degrau de atenção é o caramelo da marca | 03/08/2026 | só aqui |
| 6 | VIP manual, não derivado de contagem de visitas | 03/08/2026 | `ADR 0003` |
| 7 | Sem funcionalidades inexistentes na interface ("Importar contatos", "Escanear código de barras") | 03/08/2026 | só aqui |
| 8 | O código é a fonte de verdade da identidade; o documento se corrige | 03/08/2026 | só aqui |
| 9 | Sem camada de alias de tokens; nomes finais direto | 03/08/2026 | só aqui |
| 10 | Aceitar CSS externo compartilhado em `app/ds/` | 03/08/2026 | ✅ **aprovado e implementado** — os quatro arquivos existem e são carregados |

**Decisão 3 foi revertida em 15/08/2026.** A recusa do grafo de código valia
enquanto a extração semântica rodava em subagente Claude (315.897 tokens). Com
`GEMINI_API_KEY` no ambiente e escopo enxuto, a rodada custou 70.960 tokens de
Gemini e o grafo saiu com 734 nós contra 258. Ver `ADR 0014` no vault.

**Decisões tomadas depois deste documento** (todas com ADR no vault, nenhuma
duplicada aqui): fuso `Europe/Dublin` (0005) · disponibilidade delegada a
`staff_work_blocks` (0006) · expediente duplicado JS↔SQL aceito (0007) ·
confirmação de pagamento pelo webhook (0008) · reagendamento como evento (0009)
· questionário é consulta manual (0010) · painel e demo são espelhos (0011) ·
hold como `pending` (0012) · bloqueio de agenda como entidade própria (0013).

---

## 18. Template de changelog

```markdown
## [X.Y.Z] — AAAA-MM-DD

### Adicionado
- <token, componente, padrão ou regra novos>

### Alterado
- <o que mudou e qual o impacto no código existente>

### Depreciado
- <o que sai, o que entra no lugar, prazo>

### Removido
- <o que saiu de vez, depreciado desde quando>

### Corrigido
- <divergência entre documento e código, resolvida em favor de qual>

### Pendente
- <decisão em aberto e o que ela bloqueia>
```

---

## 19. Template de ADR

```markdown
# ADR NNNN — <título curto>

- **Data:** AAAA-MM-DD
- **Status:** proposto | aceito | recusado | substituído por ADR NNNN
- **Decisor:** <quem>

## Contexto
<o problema, e o que era verdade quando a decisão foi tomada>

## Decisão
<o que foi decidido, em uma frase>

## Alternativas consideradas
<o que foi descartado e por quê — esta seção é a que tem valor daqui a um ano>

## Consequências
<o que passa a ser verdade; o que fica mais fácil; o que fica mais caro>

## Reversibilidade
<como voltar atrás, e o que custaria>
```

---

## 20. Checklist de revisão

Antes de aprovar qualquer mudança:

**Identidade**
- [ ] Passa nos critérios de [01 §11](01_PRODUCT_LANGUAGE.md)
- [ ] Nenhum antiattribute de [01 §7](01_PRODUCT_LANGUAGE.md) reintroduzido

**Princípios**
- [ ] Checklist de [02](02_DESIGN_PRINCIPLES.md#uso-em-revisão) cumprido

**Sistema**
- [ ] Nenhum valor literal
- [ ] Nenhuma regra proibida de [03 §20](03_DESIGN_SYSTEM.md) violada
- [ ] Nenhum componente novo sem proposta aprovada
- [ ] Movimento dentro da escala de [05](05_MOTION_SYSTEM.md)
- [ ] Texto conforme [06](06_CONTENT_GUIDELINES.md)

**Acessibilidade** *(veto)*
- [ ] Checklist de [07 §18](07_ACCESSIBILITY.md) cumprido

**Técnico**
- [ ] [08 §20](08_IMPLEMENTATION_RULES.md) cumprido
- [ ] Painel e demo espelhados
- [ ] Backend, banco, rotas e regra de negócio intactos

**Documentação**
- [ ] Documento afetado atualizado
- [ ] Changelog atualizado
- [ ] ADR escrito **em `vault/03 - Decisions/`**, se houve mudança de regra
- [ ] Exceção registrada no formato de §7, se houver

---

# Changelog

> Este changelog cobre o **Design System**. O registro narrativo de cada
> entrega (o que foi decidido e por quê) está em `vault/05 - Handoffs/`, e o
> estado corrente do produto em
> `vault/00 - Start Here/Estado Atual do Produto.md`.

## [1.5.0] — 2026-08-18

Financeiro V1 e a navegação final. **Nenhum token global mudou** — a aba foi
construída inteira sobre a família visual já existente da Insights (`.ins-period`,
`.ins-answer`, `.ins-kpis`, `.ins-svc`, `.ins-chart-card`), sem hex, raio,
sombra ou duração nova.

⚠ **Por que minor e não major.** Pelo §13, alterar valor de token é major. Não
houve alteração de token: o que entrou foram classes **novas e locais**
(`.fin-*`, `.an-*`) e uma **exceção de conteúdo registrada** (§24.1 de
[06](06_CONTENT_GUIDELINES.md)), que restringe em vez de afrouxar.

### Adicionado
- **§24.1 de [06](06_CONTENT_GUIDELINES.md) — abreviação monetária em escala de
  gráfico.** `€1k` / `€1,5k` passa a ser permitido **exclusivamente** em rótulo
  de tick de eixo analítico, sob três condições cumulativas (é régua e não
  quantia; o valor exato existe em outro lugar da tela; o `aria-label` descreve
  por extenso). Fora disso, abreviar dinheiro continua proibido — inclusive num
  eixo que não cumpra as três.
- **Distribuição Analytical** (`.fin-an-*`): escala com topo arredondado em
  passos de 1 / 2 / 2,5 / 5 × 10ⁿ, baseline explícita, gridlines nos ticks,
  barras de `border-radius: 0` e no máximo 26px, sem sombra, sem gradiente,
  sem glow, sem curva elástica. O período corrente é marcado por um tick de 2px
  sob o eixo, **nunca** por anel ou halo.
- **Padrão de reserva de largura por sizer** (`.an-medida` / `.an-sizer`): um
  irmão invisível em fluxo normal com o pior caso da string reserva a largura da
  caixa, e o número deixa de causar layout shift ao mudar. Substitui a largura
  em `ch`, que erra porque o símbolo e o separador não medem o mesmo que um
  dígito nem em tabular. Também é o que dá largura à coluna do eixo Y, cujos
  filhos são todos `position: absolute` e mediriam **zero**.
- **`.ins-svc-pct`** — participação percentual do serviço, mesma anatomia de
  `.ins-svc-hour`.
- **`.fin-from` / `.fin-final`** — marcadores de "a partir de" e "Valor final".
  Distinção por **peso e tom, nunca por cor**: nenhum dos dois é estado de
  alerta, e cor ali viraria semáforo onde não há problema.
- **Rodapé com seis abas** para `owner` e quatro para `staff`. `nav button`
  passou a `flex: 1 1 0` e o corpo do rótulo baixa por degraus em ≤400px e
  ≤350px, porque "Financeiro" é o rótulo mais longo do app. Verificado sem
  overflow e sem scroll horizontal em 320 / 375 / 390 / 430.

### Pendente
- **Redesenho da Insights** para a divisão `Insights = diagnóstico operacional`
  / `Financeiro = evolução do valor`. Preview aprovado, não portado. Enquanto
  não entrar, "Onde está o dinheiro" e "Tendência" continuam na Insights e
  repetem, por outro caminho, o que o Financeiro mostra.

---

## [1.4.0] — 2026-08-15

Agenda Visual V2 (commit `f36d908`). Redesenho **só visual** da timeline —
referência estrutural: Calendar do iPhone; identidade, cor e tipografia
continuam Orenzi. **Nenhuma regra de negócio mudou**: conflito, disponibilidade,
gaps, `schedule_blocks`, booking, Stripe, Questionário, Clientes e Insights não
foram tocados.

⚠ **Por que minor e não major.** Pelo §13, alterar valor de token e remover
componente é major. Os valores abaixo são **locais da Agenda**: não estão em
`app/ds/orenzi-tokens.css`, não estão em [03](03_DESIGN_SYSTEM.md), e as
classes removidas não constam da lista de componentes autorizados de
[04](04_COMPONENT_LIBRARY.md). São internos ao componente, não identidade
global — por isso minor. **`TimelineItem` é a única exceção**: `.timeline-appt`
converge para ele ([04 §TimelineItem](04_COMPONENT_LIBRARY.md)), e o documento
dele precisa ser atualizado com a nova geometria. Registrado como pendente
abaixo.

### Adicionado
- **Escala temporal única `PX_PER_MINUTE`** (`= HOUR_HEIGHT / 60`). Todo `top` e
  toda `height` da grade passam por `minutesToPx()` e `agendaOffsetMinutes()`.
  Nada é posicionado por aproximação — verificado no navegador: 09:30 cai em
  0,5000 entre as linhas de 09:00 e 10:00, 09:40 em 0,6667, 10:35 em 0,5833,
  12:30 em 0,5000.
- **`--appt-bar-w: 5px`** — barra de destaque (`.timeline-appt::before`) no
  lugar do `border-left: 3px`. Cor = `c.border` com 15% de `c.text`. Corre a
  **altura inteira**, atravessando a pausa: é ela que faz
  `work_before + gap + work_after` lerem como uma reserva só. Contraste medido
  contra o fundo do próprio card: **1,9–2,9:1**, abaixo dos 3:1 de componente
  não-textual e **aceito de propósito** — a barra é ênfase, não portadora de
  informação (a categoria já está no preenchimento e no texto). Exceção no
  formato de §7.
- **`APPT_MIN_HEIGHT` (14px)** — piso em **pixels**, só alvo de toque.
- **`GRID_HAIRLINE` (2px)** — fio de separação constante, não escala com a
  duração, então o topo do card continua exato.
- **Encaixe aninhado**: `NIVEL_RECUO` e `NIVEL_RECUO_DIR` (8px por nível, à
  esquerda e à direita) + `Z_APPT` (10, +1 por nível). O recuo à direita expõe
  a fatia do card de baixo.
- **`apptTimeRange()`** — o card passa a mostrar a **faixa de horário**
  ("Coloração · 9:00–11:30"), nunca a duração. Classes `.hours`,
  `.micro-hours`, `.compact-hours`.
- **Pager de dias por arrasto horizontal** (`bindAgendaPager()`,
  `pagerSettle()`, `pagerCommit()`, `pagerGoTo()`): três páginas irmãs num
  trilho, `touch-action: pan-y` na `.timeline`, direction lock por
  `PAGER_INTENT_PX` (8px) e `|dx| > |dy| * 1.2`, commit por
  `PAGER_COMMIT_RATIO` (22% da largura) **ou** `PAGER_FLICK_VELOCITY`
  (0,45 px/ms) na mesma direção do deslocamento.

### Alterado
- **`--appt-head-h` e `APPT_HEAD_SAFE`: 44 → 40.** Os dois espelham o mesmo
  valor e **têm que mudar juntos**.
- **`--tl-gutter`: 52 → 40px** (só rótulos de hora, formato `9:00`, sem zero à
  esquerda) e **`--tl-card-left`: 6 → 4px**. O eixo esquerdo saiu de 58px
  somados para 44px.
- **`AGENDA_APPT_COMPACT_MAX_MINUTES`: 60 → 45.** Consequência direta do
  padding: com 8px as duas linhas medem 36,8px e cabem num card de 45min (que
  mede 43px); com 12px não cabiam.
- **Padding do card: 12/14px → `8px 10px`** (mais `--appt-bar-w + 9px` à
  esquerda). Não altera altura (ela é px), mas afrouxava o topo e roubava a
  segunda linha de texto.
- **Recuo do encaixe: 18 → 8px por nível.** A 24px o encaixe lia como card
  decorativo dentro de outro card.
- **Altura vem só da duração** — saiu o `Math.max(20, durMins)`, que era piso em
  **minutos** e esticava a duração desenhada de um atendimento curto.
- **Pausa (`.appt-gap`)**: véu branco sobre a própria cor do card, com fade de
  6px nas duas pontas, começando em `left: var(--appt-bar-w)`. Passa a ser um
  **nó vazio** — nada de flex dentro.
- **Camadas da `.timeline` documentadas em lista única no CSS**: 0 linhas ·
  1 `.agenda-free-slot` · 4 `.timeline-block` · 10 appointment (+1 por nível) ·
  30 linha do horário atual · 200 overlays.
- **Cabeçalho**: o botão da esquerda mostra o **mês por extenso** (`Agosto`) com
  chevron; fora do ano corrente volta abreviado com ano (`Set 2027`), o único
  formato que cabe em 320px.

### Removido
- **`.gap-label`** ("⏱ pausa · 70min"). A pausa passa a ser comunicada **só**
  pelo fade. Motivo de leitura: o rótulo brigava com o nome da cliente e, num
  card com encaixe por cima, ficava escondido metade das vezes — informação que
  aparece por acaso é pior que informação nenhuma. **Não se substitui por outro
  texto.** A duração da pausa sobrevive em `segmentsOf()` e no detalhe.
- **`.status-dot`** (bolinha de status nos tiers micro/compact). Como
  `statusLabel(null)` devolve `'Confirmado'` e `statusClass()` cai em
  `st-confirmed` por omissão, ela aparecia em **100% dos cards** quase sempre na
  mesma cor: legenda que não existia em lugar nenhum. **Nada de dot sem
  rótulo** — se voltar a existir sinal de status na agenda, tem que ser texto.
- **`.agenda-free-slot`** (cards tracejados "Xh livres"). A ausência de card já
  significa disponibilidade; num calendário de verdade ninguém pinta o buraco.
  Saiu **só o desenho** — `computeFreeGaps()`, `freeSlotLabel()`,
  `AGENDA_FREE_MIN_MINUTES` e `openNewApptModalAt()` continuam intactos. Junto
  saiu `bindFreeSlotClicks()`, que não tinha mais elemento para amarrar.
- **`.dur`, `.micro-dur`, `.compact-dur`** — substituídas pelas `*-hours`.
- **`renderAgendaGridTransition()`** — o toque na faixa de dias passa pelo mesmo
  motor do gesto (`pagerGoTo()`). `slidePane()` continua sendo o motor da troca
  de **semana** (`renderAgendaTransition`), que é outro nível.

### Acessibilidade
- **A duração sobrevive só no `aria-label`**, de propósito: quem não vê a altura
  do card não tem de onde tirá-la.
- **`prefers-reduced-motion`**: o dedo continua sendo acompanhado no arrasto
  (feedback direto é acessibilidade, não decoração); só o snap vira instantâneo.
- Formato 24h **sem zero à esquerda**, igual aos rótulos da coluna de hora. 12h
  com AM/PM seria a referência americana e não existe em lugar nenhum do painel.

### Não alterado, de propósito
- **Bloqueio manual** ganhou o mesmo eixo e a mesma escala, e só isso: segue
  hachurado, neutro e **sem barra de destaque**. Pausa clareia ("cabe encaixar
  alguém"), bloqueio hachura — a distinção de 10/08/2026 continua valendo.
- **`.tb-time` do bloqueio** continua em `fmtTime()` (`14:00–16:00`, com zero à
  esquerda) — fora do escopo desta rodada.

### Pendente
- **[04 §TimelineItem](04_COMPONENT_LIBRARY.md) desatualizado.** Ainda diz
  "**Converge:** `.timeline-appt` — implementação já correta" e lista tokens
  `--radius-sm` / `--text-caption`, sem a nova geometria, a barra de destaque
  nem a regra de faixa de horário. Precisa ser reescrito.

---

## [1.3.0] — 2026-08-15

Questionário V2 (commit `a692d27`). Primeira tela do painel construída
inteiramente sobre a anatomia de `FullScreenSheet` introduzida em 1.2.0.

### Adicionado
- **`.quiz-option` / `.quiz-option-label` / `.quiz-option-mark`** — escolha em
  **cartão** no lugar do `<select>` nativo. `min-height: 56px` (alvo de toque),
  `padding: var(--space-4)`, `gap: var(--space-3)`, `--font-body`,
  `--text-body-size`, `--color-text`. Sem valor cru.
- **`.quiz-progress` / `-track` / `-fill` / `-label`** — progresso "N de 7".
  Track de 3px com `--radius-full` sobre `--color-neutral-200`.
- **`.quiz-ref` / `-check` / `-counter` / `-name` / `-swatch`** — tiles de
  referência visual, seleção múltipla até 3, com contador. **0 é resposta
  válida.**
- **`.quiz-lang-list`** — escolha de idioma (`pt-BR`, `en`, `es`). **Sem
  bandeira: idioma não é país.**
- **`.quiz-welcome`** — saudação alternando, a palavra sobe e a próxima entra
  por baixo. O movimento usa **`--motion-route` (280ms)**, o degrau mais lento
  da escala de [05 §3](05_MOTION_SYSTEM.md), espelhado no JS como
  `QUIZ_WORD_SWAP_MS`.
- **Modo quiosque** (`setKioskMode()`) — esconde `header` e `nav` enquanto o
  tablet está com a cliente. Padrão novo: até aqui nenhuma tela do painel
  escondia o chrome.

### Alterado
- **Estado vazio do relatório: toast → tela.** Alinha com o padrão de empty
  state do resto do app.
- **CTA nomeia a ação:** "Salvar questionário", com busy e erro por `orenziUI`.
- **`FullScreenSheet`** (1.2.0) aplicado fora da Agenda pela primeira vez, com
  `100dvh` e safe areas — confirmando a anatomia head → body rolável → footer
  fixo como padrão geral, não como solução local da Agenda.

### Removido
- **`<select>` nativo** do fluxo do questionário.
- **Auto-advance no `onchange`** — a V1 pulava de tela e não havia como revisar.
- **O `✕` que gravava.** Fechar deixou de ser um caminho de salvamento.

### Exceção registrada (formato de §7)
- **`QUIZ_WELCOME_DWELL_MS` (2600ms) está fora da escala de movimento de
  [05 §3](05_MOTION_SYSTEM.md)**, e isso é deliberado: é tempo de **leitura**,
  não de transição — mesma natureza do `SUCCESS_HOLD_MS` de
  `app/ds/orenzi-ui.js`. Declarado no comentário do próprio CSS.

### Não alterado, de propósito
- **Stripe depósito sandbox** (commit `d342808`, 14/08/2026) **não gerou
  entrada de DS**: não introduziu token, componente nem padrão. O que ele
  acrescentou foi uma **regra de implementação** — o Payment Element não
  sobrevive a `innerHTML`, então a casca da tela de pagamento é desenhada uma
  vez por abertura e só `#payStatus` é reescrito (medido: 1 mount em 7
  renders). Pertence a [08](08_IMPLEMENTATION_RULES.md), não aqui.
- **Nenhuma resposta do questionário deriva regra de negócio.** Decisão de
  produto, não lacuna — ver `vault/03 - Decisions/ADR 0010`.

---

## [1.2.1] — 2026-08-13

Correção de semântica de movimento na folha de tela cheia, no mesmo dia da
1.2.0. Nenhuma mudança de layout, conteúdo ou regra de negócio.

### Corrigido
- **A entrada vertical era uma regra do container, não um evento.** Enquanto
  `animation: fullSheetIn` viveu no `.o-fullsheet`/`.o-wizard-sheet`, todo
  re-render a reaplicava — cada etapa do wizard e cada toque no segmented
  control disparavam bottom→top, e o fluxo lia como uma pilha de modais
  abrindo uma sobre a outra. Virou a classe `.is-entering`, posta só por
  `openFullSheet()`.
- **Navegação interna virou horizontal** (§14b de [05](05_MOTION_SYSTEM.md)):
  menu → destino e destino → menu deslizam dentro da folha já aberta, com
  parallax de −28% na tela que sai. Antes fechavam e reabriam a folha.
- **Etapas do wizard não recriam mais o shell.** `renderWizard()` foi partido
  em `paintWizardShell()` (entrar no fluxo) e `paintWizStep()` +
  `updateWizChrome()` (trocar de etapa). Medido: o elemento do shell é o
  mesmo objeto entre etapas.
- **Segmented control ganhou indicador que desliza** (`.blk-seg-thumb`,
  posicionado por `transform`). Antes era o fundo do botão que acendia e
  apagava — fundo interpola cor, não posição.
- **Trocar o tipo de bloqueio não move mais a tela.** Só a região abaixo do
  segmented troca, com fade + 4px e altura interpolada. Medido: título,
  subtítulo, data e o próprio segmented ficam no mesmo pixel (12 / 38 / 133 /
  259) antes e depois.

### Adicionado
- `--motion` de navegação de página: 260ms + `--ease-out`, reaproveitando as
  curvas existentes — nenhuma duração ou easing novo.

### Verificado
- Estado sobrevive a toda transição: data, início, fim e motivo preservados ao
  alternar o segmented (o motivo vive na região que é recriada, mas o valor
  vem do state, que é a autoridade).
- `prefers-reduced-motion`: zero animações, zero clones de palco, altura da
  região dinâmica não fica presa em px.

## [1.2.0] — 2026-08-13

Extensão do sistema pedida pelo dono do produto ao repaginar os sheets da
Agenda. Registrada aqui por causa da regra 8 do contrato de UI: o Design
System não cobria folha de tela cheia, então a lacuna vira componente
documentado em vez de exceção local silenciosa.

### Adicionado
- **`FullScreenSheet`** ([04](04_COMPONENT_LIBRARY.md#fullscreensheet)) —
  variante de tela cheia do `BottomSheet`, para o caso que o próprio
  `BottomSheet` já mandava não ser folha parcial: *"não usar para fluxo de
  várias etapas — é tela"*. Anatomia fixa: head (voltar/fechar + títulos) →
  body rolável → footer com o CTA.
- **Motion:** entrada `translateY(100%) → 0` em `--motion-emphasized` +
  `--ease-out`, a mesma receita de folha inferior de
  [05 §14](05_MOTION_SYSTEM.md) — o que muda é o destino, não a curva.

### Alterado
- **Os três níveis da Agenda** (menu do `+`, novo agendamento, bloquear
  horário) passam de folha parcial a `FullScreenSheet`. O wizard de novo
  agendamento era `min(92vh, 800px)` com raio no topo, o que no celular lia
  como cartão alto encostado no rodapé; o fluxo, os passos e o conteúdo não
  mudaram — só o container.
- **`Bloquear horário`** foi repaginado: campos soltos viraram linhas de
  cartão (`.blk-row`), o par Início/Fim virou dois cartões lado a lado, e o
  toggle de período virou segmented control. O `<input type="date"/"time">`
  nativo continua sendo o controle — perdeu a moldura, ganhou alvo de toque.
- **CTA nomeia a ação:** "Bloquear dia" quando é dia inteiro, "Bloquear
  horário" quando é intervalo ([06 §11](06_CONTENT_GUIDELINES.md)).

### Não alterado, de propósito
- **`BottomSheet` parcial continua existindo e correto** para escolha curta:
  ordenação, filtros, folha do FAB do Estoque, e o **detalhe do bloqueio** —
  leitura curta com duas ações não é fluxo de várias etapas. Só a linguagem
  dos botões do detalhe convergiu para `.o-btn`.
- `.toggle-row` (o par de pílulas antigo) segue servindo as outras telas.

### Medido no navegador
- Três níveis a `top: 0` com altura igual à viewport, em 320px, 375px e no
  desktop (480px centralizado, sem esticar — regra 5 do contrato).
- Contraste dos elementos novos: menor valor 5,02:1 (CTA primário) — todos
  aprovam AA.
- Alvos de toque: ação do menu 88px, linha de data 79px, cartão de hora 73px,
  segmented 50px, CTA 44px.

## [1.1.0] — 2026-08-03

Decisões oficiais do dono do produto sobre as pendências abertas na v1.0.
Nenhum código alterado — só documentação.

### Adicionado
- ADR retroativo 10 registrado: aprovação do CSS externo compartilhado.

### Alterado
- **Botão primário e toda superfície sólida com texto** passam a usar
  `--color-accent-700` de fundo (5,02:1). `--color-accent` permanece só como
  cor gráfica/decorativa — nunca fundo de texto pequeno.
- **Avatar com iniciais** passa a usar `--color-accent-700` sobre
  `--color-accent-100`, em vez de branco sobre `--color-accent`.
- **Raios convergem**: 18→16, 22→20, 13/14→12, 11→12 (não 10 — a escala oficial
  não inclui esse degrau). Migração componente por componente, nunca global.
- **Botões usam sentence case.** Caixa alta eliminada, inclusive de
  `agendar.html`. Permitida só em microbadge, data compacta e código.
- **Galeria de fotos**: rolagem horizontal é o padrão mobile oficial (miniatura
  96–112px, raio 12px, botão de adicionar ao final). Grade só em ampliação,
  desktop futuro ou página dedicada.
- **Canvas no desktop**: fundo lateral `--color-bg` liso, sem moldura de
  celular nem decoração. Header, main, nav, FAB e overlays devem futuramente
  pertencer ao mesmo shell.
- **Cormorant Garamond confirmada como exclusiva da landing.** O app
  operacional usa só Poppins (títulos) e Jost (corpo/controles).

### Corrigido
- Tabela de contraste de [03 §6](03_DESIGN_SYSTEM.md) — os dois pares
  reprovados da v1.0 (CTA a 3,12:1; branco sobre caramelo a 3,64:1) estão
  resolvidos.

### Pendente — consequências medidas da própria decisão
- **P9:** iniciais do avatar `sm` (40px) medem 4,36:1 — 3% abaixo do mínimo de
  texto pequeno. Avatar `lg` (72px) passa, por cair no limiar de 3:1.
- **P10:** o círculo `accent-100` do avatar tingido mede 1,15:1 contra o fundo
  e quase não se distingue como forma. Proposta: borda de 1px
  `--color-divider`.

### Pendente — mantidas em aberto
- P5 (nomenclatura da landing), P7 (zoom 200%), zoom automático de campo em
  iOS.

### Pendente — confirmadas no backlog, não bloqueiam
- Vocabulário multissetorial: manter o vocabulário de salão agora; evitar
  hardcode novo onde um rótulo configurável for igualmente barato; não
  construir ainda o sistema completo.
- Questionário multilíngue: código novo não pode criar estrutura que
  impossibilite internacionalização futura ([06 §26](06_CONTENT_GUIDELINES.md)).

---

## [1.0.0] — 2026-08-03

Primeira versão da documentação estratégica do Orenzi.

### Adicionado
- `01_PRODUCT_LANGUAGE.md` — manifesto, personalidade, promessa e critérios de
  avaliação.
- `02_DESIGN_PRINCIPLES.md` — 14 princípios de decisão com aplicação,
  contraexemplo e perguntas de revisão.
- `03_DESIGN_SYSTEM.md` — fundações visuais oficiais, extraídas do código.
- `04_COMPONENT_LIBRARY.md` — 39 componentes em três níveis, com mapa de
  convergência das duplicações atuais.
- `05_MOTION_SYSTEM.md` — 5 tokens de duração e mapeamento das ~29 durações
  existentes.
- `06_CONTENT_GUIDELINES.md` — voz, vocabulário e termos oficiais do produto.
- `07_ACCESSIBILITY.md` — alvo WCAG AA e plano de correção em P0/P1/P2.
- `08_IMPLEMENTATION_RULES.md` — arquitetura sem build e ordem de migração em 10
  pull requests.
- `09_UX_PATTERNS.md` — 29 padrões recorrentes com regras quantitativas.
- `10_GOVERNANCE_AND_CHANGELOG.md` — este documento.
- `README.md` — índice e ordem de leitura.

### Alterado
- **A identidade visual oficial passa a ser a do código.** Todos os valores
  foram extraídos de `app/painel.html`, `app/agendar.html` e `app/index.html` na
  auditoria de 03/08/2026.

### Corrigido
Divergências entre a versão provisória e o produto real, todas resolvidas em
favor do código:
- fundo `#F5EFE6` → **`#f3ede4`**; superfície `#FBF7F1` → **`#f7f1e8`**;
  texto `#241C18` → **`#2b2420`**; ação `#A85F2A` → **`#b6784a`**;
  crítico `#BD3B3B` → **`#b23a3a`**;
- `status.warning` amarelo **eliminado** — o degrau de atenção é o caramelo da
  marca, decisão consciente do produto;
- `status.success` de um valor → **dois** (`#4f8a5b` gráfico, `#3b6744` texto),
  por exigência de contraste;
- peso tipográfico 650 → **600** (650 não existe em Poppins);
- corpo 16px → **15px**, que é a escala real do produto;
- gutter 24px → **20px**;
- escala de espaçamento passa a **incluir 10px e 14px**, que são dos valores mais
  usados;
- `radius-sm` 10px → **12px**;
- estrutura `src/design-system/` → **`app/ds/`** com três arquivos CSS, adequada
  a um projeto sem build.

### Depreciado
- `ORENZI_DESIGN_SYSTEM_v1.0.md` — substituído por `03_DESIGN_SYSTEM.md`.
  Mantido no repositório apenas como registro histórico; **não usar como
  referência**.
- `--color-neutral-100`, `--shadow-sm/md`, `--radius-*` de `agendar.html`,
  `.btn-see-more`, espaçamentos fora da escala, emojis como ícone.

### Pendente
Nenhuma implementação foi iniciada. Bloqueios registrados em
[03 §21](03_DESIGN_SYSTEM.md) e [08 §23](08_IMPLEMENTATION_RULES.md):

- **P0 técnico:** contraste do CTA (3,12:1) e canvas não centralizado no
  desktop.
- **Estrutural:** aprovação para criar `app/ds/*.css` — primeiro CSS externo do
  projeto.
- **Visual:** convergência de raios, caixa alta do botão, branco sobre caramelo,
  padrão único de fotos.
- **Identidade:** Cormorant Garamond é do produto ou só da landing.
- **Produto:** vocabulário configurável para outros ramos; questionário
  multilíngue.

---

**Voltar ao índice:** [README](README.md).
