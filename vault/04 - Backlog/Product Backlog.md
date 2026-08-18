# Product Backlog

Ordenado por acordo, não por tamanho.

## Fila aprovada

| # | Frente | Estado |
|---|---|---|
| 1 | ~~**[[Splash]]**~~ | ✅ **fechada 15/08/2026** — já existia em produção sem registro; foi redesenhada, não criada |
| 2 | ~~**[[Login]]**~~ | ✅ **fechada 15/08/2026** — V2 "cartão de recepção", com sessão expirada resolvida |
| 3 | **Password Recovery end-to-end** | aberta pelo fechamento do Login — ver abaixo |
| 4 | demais pendências do app | ver abaixo |
| 5 | Product Map / SaaS | **só depois do Orenzi finalizado** |

## Pendências do app, com escopo já anotado

### Password Recovery end-to-end — não iniciada

O [[Login]] V2 saiu **sem** recuperação de senha, e **sem link** prometendo
uma: um "Esqueci minha senha" que não leva a lugar nenhum é pior que a
ausência. Só entra completo, com as seis etapas:

`solicitação → e-mail → callback seguro → definição de nova senha → confirmação
→ retorno ao Login`

O e-mail depende da verificação do domínio na Resend (ver
[[Waiting on Juliane]]) ou do remetente padrão do Supabase Auth — decidir qual
faz parte do escopo.

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

### ~~Valor do atendimento editável~~ — entregue em 17/08/2026

Adiado em 03/08 como D2, e a previsão da época era `appointments.price`. O que
foi implementado é **`final_price`** — ajuste manual posterior, escrito só pela
RPC `set_appointment_final_price()`, com `NULL` devolvendo o valor ao snapshot
do booking. O alcance previsto se confirmou: toda conta de valor passou a ler
`appointmentRevenue()`, ponto único. Ver [[Financeiro]] e `app/CLAUDE.md`.

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
