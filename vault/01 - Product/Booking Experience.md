# Booking Experience

**Estado: Booking V2 em produção. Sinal de 20% é obrigatório.**

## O fluxo da cliente

`app/agendar.html`, **3 passos** (não 4):

1. serviço
2. data e hora
3. dados + política + **pagamento do sinal**

O passo de escolher profissional **saiu do fluxo**: com uma só ativa, a
escolha é feita sozinha. `state.pulaEscolhaStaff` manda — o `init()` chuta pelo
total de ativas e `advanceFromStep1()` confirma pela lista do serviço.
O número interno do passo continua 1–4; só a contagem exibida muda. **Se uma
segunda profissional voltar a ficar ativa, a tela reaparece sozinha.**

⚠ `loadStaffForService()` **filtra por `active`**. Todas as cinco estão ligadas
a todos os 15 serviços em `staff_services` — sem esse filtro a cliente escolhia
entre cinco pessoas, quatro fora do salão, incluindo a recepcionista.

## Sinal obrigatório

Não existe caminho público sem pagamento. O `event_type: 'created'` ainda
existe na Edge e na RPC, mas o Booking não usa: um caminho paralelo sem cobrança
seria porta dos fundos para reservar de graça.

Regras do sinal em [[Payments - Stripe]].

## Self-service (`app/gerenciar.html`)

Entrada por `manage_token` na URL. Permite **remarcar** e **cancelar**.

- `get_booking_by_token` traz o agendamento (e o `staff_id`)
- `get_busy_slots` monta a disponibilidade na tela
- a autoridade final continua sendo `reschedule_booking_by_token` — a tela só
  oferece, o banco decide
- gera `.ics` a partir da resposta, **sem o token dentro**

O token é rotacionado a cada confirmação e nunca é gravado nem logado.

## Reagendamento é evento

Não é UPDATE destrutivo: `appointment_events` guarda o histórico.
Ver [[ADR 0009 - Reschedule como evento]].

## Armadilha de teste

⚠ **`agendar.html` testa em PRODUÇÃO.** Confirmar cria agendamento real e
dispara e-mail. `sb.functions` não dá pra interceptar — para simular, intercepte
`window.fetch`.

## Fuso

O expediente é de Dublin, não do aparelho de quem agenda. O Booking público
nunca teve o bug de data civil porque tira o "hoje" de
`Intl.DateTimeFormat('en-CA', { timeZone })` e monta instante com `Date.UTC()`.
Ver [[Schedule Availability]].

## Source of truth

`app/CLAUDE.md` · `app/agendar.html` · `app/gerenciar.html` ·
`graphify path "commitBooking()" "public.create_public_booking_orchestrated()"`

## Links

[[Booking Architecture]] · [[Payments - Stripe]] · [[Schedule Availability]] ·
[[Handoff 2026-08-14 Stripe Sandbox]]
