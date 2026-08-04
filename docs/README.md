# Documentação do Orenzi

**Versão 1.0 · 03/08/2026**

Esta pasta define como o Orenzi pensa, se comunica, é desenhado e deve evoluir.

---

## Para que serve

Antes desta versão, as decisões de design do Orenzi viviam em três lugares: no
código, na cabeça do dono do produto, e num documento provisório cujos valores
não batiam com o produto real.

Estes dez documentos existem para que:

- **quem implementa** saiba o que já foi decidido, e não invente valor;
- **quem revisa** tenha critério objetivo, não gosto pessoal;
- **quem chega depois** entenda por que o Orenzi é como é;
- **um agente de IA** possa trabalhar sem redescobrir o produto a cada sessão.

---

## Ordem de leitura

Do porquê ao como. Cada documento pressupõe o anterior.

| # | Documento | Em uma frase |
|---|---|---|
| 1 | [Product Language](01_PRODUCT_LANGUAGE.md) | Quem o Orenzi é e como deve ser percebido. |
| 2 | [Design Principles](02_DESIGN_PRINCIPLES.md) | Catorze princípios que transformam essa identidade em decisão. |
| 3 | [Design System](03_DESIGN_SYSTEM.md) | Os valores visuais oficiais, extraídos do código. |
| 4 | [Component Library](04_COMPONENT_LIBRARY.md) | Os 39 componentes autorizados e o que deve convergir para eles. |
| 5 | [Motion System](05_MOTION_SYSTEM.md) | Como o produto se move e responde ao toque. |
| 6 | [Content Guidelines](06_CONTENT_GUIDELINES.md) | Como o Orenzi escreve, e o vocabulário oficial. |
| 7 | [Accessibility](07_ACCESSIBILITY.md) | Mínimos inegociáveis e o plano de correção. |
| 8 | [UX Patterns](09_UX_PATTERNS.md) | Vinte e nove soluções canônicas para problemas recorrentes. |
| 9 | [Implementation Rules](08_IMPLEMENTATION_RULES.md) | Como implementar tudo isso sem build, sem framework. |
| 10 | [Governance e Changelog](10_GOVERNANCE_AND_CHANGELOG.md) | Como propor, aprovar e versionar mudanças. |

⚠ **Os padrões de UX (arquivo `09`) vêm antes das regras de implementação
(arquivo `08`) na ordem de leitura.** A numeração dos arquivos segue a estrutura
combinada; a ordem de leitura segue a lógica: decidir o comportamento antes de
decidir como codificá-lo.

**Leitura mínima por papel:**

| Se você vai… | Leia |
|---|---|
| Desenhar uma tela | 1, 2, 3, 4, 9 |
| Implementar um componente | 3, 4, 5, 7, 8 |
| Escrever texto de interface | 1, 6 |
| Revisar uma proposta | 1 §11, 2, 7, 10 |
| Decidir escopo de produto | 1, 10 |

---

## Como os documentos se relacionam

```
      01 Product Language          o que somos
              │
      02 Design Principles         como decidimos
              │
   ┌──────────┼──────────┬──────────────┐
   │          │          │              │
  03         05         06             09
Design     Motion     Content        UX Patterns
System     System     Guidelines
   │
  04 Component Library
   │
   └──────────┬──────────┘
              │
      07 Accessibility             veto sobre tudo
              │
      08 Implementation Rules      como vira código
              │
      10 Governance                como tudo isso muda
```

**Regra de conflito:** vence o documento de número menor, com duas exceções —
**acessibilidade tem veto**, e **backend, banco, rotas e regras de negócio são
intocáveis**. Detalhe em [10 §2](10_GOVERNANCE_AND_CHANGELOG.md).

---

## Fonte de verdade

**O código é a fonte de verdade da identidade. Estes documentos são a fonte de
verdade das regras.**

- Divergência de **valor** → o código vence, o documento se corrige.
- Divergência de **regra** → o documento vence, o código se corrige.

Foi por isso que a versão provisória do Design System foi substituída: ela
propunha `#F5EFE6` como fundo enquanto o produto usa `#f3ede4`. Corrigimos o
documento.

⚠ `ORENZI_DESIGN_SYSTEM_v1.0.md` está **substituído** por
[`03_DESIGN_SYSTEM.md`](03_DESIGN_SYSTEM.md). Permanece no repositório como
registro histórico e **não deve ser usado como referência.**

---

## Situação atual do projeto

**Fase: documentação concluída. Implementação não iniciada.**

| Etapa | Situação |
|---|---|
| Auditoria técnica | ✅ concluída em 03/08/2026, aprovada como referência |
| Documentação estratégica | ✅ esta entrega |
| Tokens centralizados | ❌ não iniciado — aguarda aprovação |
| Componentes unificados | ❌ não iniciado |
| Correções de acessibilidade | ❌ não iniciado |
| Migração de telas | ❌ não iniciada |

**O que o produto é hoje:** quatro HTMLs estáticos, sem build, sem framework,
sem npm, com CSS e JS inline e Supabase por CDN. Em uso por uma cliente real,
em Dublin.

**O que a auditoria encontrou:** três blocos de tokens sincronizados à mão, 15
raios distintos, ~29 durações de animação, 23 tamanhos tipográficos, duas
identidades de botão com o mesmo nome, e nenhuma ocorrência de `:focus-visible`,
`<label for>`, `role=` ou `aria-live` no projeto inteiro.

**O que já está certo e deve ser preservado:** o padrão de estado (cor sempre
com texto), o sistema de ícones, o modelo de card de 16px, o modelo de segmentos
da agenda, a honestidade das métricas derivadas, e a densidade das telas de
Início, Insights, Agenda, Clientes e Estoque.

---

## Próximos passos

1. **Revisar esta documentação** e aprovar ou corrigir.
2. **Resolver as decisões pendentes** de
   [03 §21](03_DESIGN_SYSTEM.md#21-decisões-pendentes) e
   [08 §23](08_IMPLEMENTATION_RULES.md#23-decisões-que-exigem-aprovação). A mais
   importante é a primeira: autorizar ou não a criação de `app/ds/*.css`.
3. **Executar o PR 1** — fundamentos, sem mudança de tela
   ([08 §19](08_IMPLEMENTATION_RULES.md#19-ordem-de-migração)).
4. **Seguir a ordem de migração**, um pull request por vez.

**Nada disso começa sem aprovação explícita.**

---

## Instrução para Claude

Ao trabalhar neste projeto:

1. **Leia antes de escrever.** `CLAUDE.md` (raiz), `app/CLAUDE.md` e os
   documentos desta pasta relevantes à tarefa. `app/CLAUDE.md` é o índice do
   código — use as âncoras dele e grep direcionado. **Nunca varra os HTMLs
   inteiros:** `painel.html` tem ~3.000 linhas e custa caro.
2. **Não invente valor.** Se um valor não está no código nem nestes documentos,
   ele não existe. Pergunte.
3. **Não decida o que está marcado como pendente.** Decisão pendente é do dono do
   produto. Um valor inventado que entra no código vira identidade por inércia.
4. **Não reabra decisões fechadas.** Tema escuro, ausência de build, ausência de
   amarelo, grafo de código — todas registradas em
   [10 §17](10_GOVERNANCE_AND_CHANGELOG.md).
5. **Não reescreva arquivos.** Mudanças cirúrgicas, um componente por vez.
6. **Painel e demo são espelhos.** Toda mudança de tela entra nos dois.
7. **Preserve backend, banco, RPCs, gatilhos, rotas e regras de negócio.**
   Sempre.
8. **Commite e dê push** ao fim de qualquer mudança relevante. Este projeto já
   perdeu trabalho por sobrescrita entre sessões — é a razão de o git existir
   aqui.
9. **Se algo não é coberto por estes documentos, pare e proponha uma extensão**
   em vez de criar uma exceção local.
10. **Responda em português, direto ao ponto.** Se o resultado não ficou bom,
    diga.

---

## Instrução para novos desenvolvedores

**Comece por aqui, nesta ordem:**

1. `CLAUDE.md` na raiz — o que é o projeto, o que já foi decidido, quais são as
   armadilhas.
2. `app/CLAUDE.md` — o mapa do código, com a tabela de âncoras.
3. Este README.
4. Os documentos 1, 2 e 3 desta pasta.

**Três coisas que vão te surpreender, e são intencionais:**

- **Não há build.** Nem npm, nem framework, nem bundler. Isso é uma decisão, não
  uma pendência. Abrir com um servidor estático qualquer.
- **Tudo é inline.** Todo o CSS e JS vive dentro de cada HTML. Existiu uma
  refatoração em módulos que foi perdida por sobrescrita entre sessões.
- **`painel_demo.html` é espelho do `painel.html`.** Só o stub do Supabase
  difere. Mudança de tela entra nos dois.

**Quatro armadilhas que já causaram falha silenciosa:**

1. **Fuso horário.** O expediente é `Europe/Dublin`, não o do aparelho de quem
   agenda. Nunca montar horário com data local — um celular no horário do Brasil
   gravava "9h" como 13h em Dublin, sem nenhum erro.
2. **Escrita autenticada precisa confirmar que alterou uma linha.** Com a sessão
   expirada, a operação passa sem tocar em nada e a tela mente.
3. **Expediente duplicado** entre a página da cliente e o painel. Mudou num, muda
   no outro — senão vira overbooking.
4. **Leitura de horário ocupado com a chave anônima** devolve lista vazia sem
   erro, e todo horário aparece livre.

**Antes de mexer no visual:** leia [03](03_DESIGN_SYSTEM.md) e
[04](04_COMPONENT_LIBRARY.md). Nenhum valor visual novo entra sem aprovação.

---

## Outros arquivos desta pasta

| Arquivo | O que é |
|---|---|
| `ORENZI_DESIGN_SYSTEM_v1.0.md` | ⚠ **substituído** por `03_DESIGN_SYSTEM.md`. Registro histórico. |
| `roadmap.md` | roadmap de padronização visual das telas (fases 0–4). Ainda vigente. |
| `instrucoes-claude-ai.md` | instruções para o Project do claude.ai — espelho do `CLAUDE.md` para o outro ambiente. |
| `SKILL.md` | material anterior, não relacionado a esta documentação. |
| `Orenzi Atelier - Proposta App e Booking System.pdf` | proposta comercial original. |
