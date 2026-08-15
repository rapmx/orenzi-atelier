# Handoff — Schedule Blocks (13/08/2026)

**Migrations:** `20260813160013_schedule_blocks_foundation`,
`20260813160050_schedule_blocks_availability_integration`.

## O que entrou

- Tabela `schedule_blocks` — entidade própria, `staff_id` obrigatório, sem
  recorrência
- Entrada no `UNION ALL` de `staff_work_blocks` — **zero linha de lógica nova**
  em `get_busy_slots`, `get_chair_load`, guard de conflito e RPCs de booking
- `trg_schedule_blocks_no_appointment_conflict` — o lado espelho do guard
- Painel: `openAgendaAddMenu()`, `openBlockModal()`, `saveScheduleBlock()`,
  `openBlockDetailSheet()`, `busyBlocksForStaffOnDate()`

## Decisões

- [[ADR 0013 - Bloqueio de agenda e entidade propria]]
- **Os três sheets da Agenda viraram tela cheia** (`.o-fullsheet`), com
  `100dvh` — nunca `100vh`: no Safari do iPhone o `100vh` conta a barra de
  endereço e o CTA cairia atrás do chrome do navegador.
- **`BottomSheet` parcial não foi aposentado** — segue correto para escolha
  curta. A regra é do DS: fluxo de várias etapas é tela, escolher entre duas
  opções é folha.

## Movimento: vertical é entrar/sair, horizontal é andar dentro

A entrada bottom→top é a classe `.is-entering`, posta **só** por
`openFullSheet()` — nunca uma regra do container. Não é preciosismo: enquanto a
animação viveu no `.o-fullsheet`, todo re-render a reaplicava, e cada etapa do
wizard parecia abrir uma modal nova.

## Bug real corrigido nesta janela

⚠ **Data civil tirada de `toISOString()`.** A Juliane tocava `22/08` e o
atendimento era gravado em `21/08`. Ver
[[ADR 0005 - Timezone Europe Dublin]] — é a armadilha mais cara do projeto.

## Links

[[Schedule Availability]] · [[Agenda]] ·
[[ADR 0006 - Disponibilidade delega tudo a staff_work_blocks]]
