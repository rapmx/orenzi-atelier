# Product Backlog

Ordenado por acordo, não por tamanho.

## Fila aprovada

| # | Frente | Estado |
|---|---|---|
| 1 | ~~**[[Splash]]**~~ | ✅ **fechada 15/08/2026** — já existia em produção sem registro; foi redesenhada, não criada |
| 2 | **[[Login]]** | aprovada, não especificada |
| 3 | demais pendências do app | ver abaixo |
| 4 | Product Map / SaaS | **só depois do Orenzi finalizado** |

## Pendências do app, com escopo já anotado

### Appointment Detail — auditoria aberta

Achado em 10/08/2026: `renderApptDetail()` é visualmente fraca perto do resto do
app e abre direto num formulário de "Atendimento" (data, serviço, fotos,
técnica, produto, fórmula, observações) — **sem nome da cliente, sem contato,
sem contexto**.

⚠ **É lista de auditoria, não especificação congelada.** O escopo real se decide
quando a frente abrir. Auditar: identidade da cliente · telefone · e-mail ·
notas · serviços · profissional · horário · duração · preço · origem/source ·
status · histórico relevante · ações disponíveis · hierarquia visual · UX/UI.

### Client History — regra escrita, nada implementado

- `cancelled` permanece no banco e **deve** aparecer no histórico com indicação
  "Cancelado" — só não aparece na agenda operacional;
- `no_show` permanece registrado quando marcado explicitamente;
- **no-show automático não foi aprovado** — "o horário passou" nunca vira
  `no_show`;
- o fluxo para marcar no-show (quem marca, de onde, com que confirmação) ainda
  será definido.

Toca a auditoria de Appointment Detail — as duas frentes se encostam.

### Valor do atendimento editável — adiado (D2)

Exigiria coluna `appointments.price` (vazia = usa o preço do serviço). É o
**maior alcance da lista**: toda conta de receita (gasto da cliente, gráfico de
evolução, indicadores de Insights) passaria a ler `a.price ?? s.price`.
Ver [[Financeiro - futuro]].

### Estoque no Design System — planejado, parado

Aguarda **4 decisões** que ainda não foram tomadas. Não implementar por conta
própria. Ver [[Estoque]].

## Explicitamente fora de escopo

**Questionário:** alerta automático · integração com Agenda · recomendação ·
expiração/revalidação · histórico navegável · multi-select das perguntas
químicas · edição posterior. Ver [[ADR 0010 - Questionario e consulta manual]].

**Pagamento:** refund automático. Ver [[Payments - Stripe]].

**Agenda:** cabeçalho que colapsa ao rolar — **já foi tentado e descartado**.

## Links

[[Estado Atual do Produto]] · [[Technical Debt]] · [[Production Blockers]] ·
[[Waiting on Juliane]]
