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
arquitetura), guardado em `/docs/adr/NNNN-titulo-curto.md`.

**Merece ADR:** mudança de token, adoção ou recusa de padrão, mudança de
arquitetura, recusa consciente de uma prática comum.

**Não merece:** escolha de implementação sem efeito sobre a regra.

**Decisões já tomadas que merecem ADR retroativo** (⚠ ainda não escritos):

| # | Decisão | Data |
|---|---|---|
| 1 | Tema escuro recusado pela cliente | anterior a 08/2026 |
| 2 | Sem build, sem framework, sem npm — decisão deliberada | anterior a 08/2026 |
| 3 | Sem grafo de código: ~300 mil tokens por extração, não se paga | 02/08/2026 |
| 4 | Cor do atendimento por categoria de serviço, não por profissional | 02/08/2026 |
| 5 | Sem amarelo; o degrau de atenção é o caramelo da marca | 03/08/2026 |
| 6 | VIP manual, não derivado de contagem de visitas | 03/08/2026 |
| 7 | Sem funcionalidades inexistentes na interface ("Importar contatos", "Escanear código de barras") | 03/08/2026 |
| 8 | O código é a fonte de verdade da identidade; o documento se corrige | 03/08/2026 |
| 9 | Sem camada de alias de tokens; nomes finais direto | 03/08/2026 |
| 10 | Aceitar CSS externo compartilhado em `app/ds/` | ⚠ **pendente de aprovação** |

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
- [ ] ADR escrito, se houve mudança de regra
- [ ] Exceção registrada no formato de §7, se houver

---

# Changelog

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
