# Agenda

**Estado: Agenda Visual V2 concluída em 15/08/2026** (commit `f36d908`).
Redesenho **só visual**. Nenhuma regra de negócio mudou.

## O que a V2 decidiu

**Uma escala só.** `PX_PER_MINUTE = HOUR_HEIGHT / 60`. Todo `top` e toda
`height` passam por `minutesToPx()`. Nada é posicionado por aproximação —
verificado no navegador: 09:30 cai em 0,5000 entre as linhas, 09:40 em 0,6667.

**Altura vem só da duração.** Saiu o `Math.max(20, durMins)`, que era piso em
*minutos* e esticava a duração desenhada. O piso hoje é `APPT_MIN_HEIGHT`
(14px, só alvo de toque).

**O card mostra a FAIXA DE HORÁRIO, não a duração.** "Coloração · 9:00–11:30",
nunca "Coloração · 2h30" — a duração já é a altura do card. 24h sem zero à
esquerda, igual à coluna de hora. A duração sobrevive **só no `aria-label`**,
de propósito: quem não vê a altura não tem de onde tirá-la.

**A grade não desenha o vazio.** Os cards tracejados de "Xh livres" saíram.
Num calendário de verdade ninguém pinta o buraco. Saiu **só o desenho** —
`computeFreeGaps()` e `openNewApptModalAt()` continuam intactos.

**A pausa não tem rótulo nenhum.** Nem texto, nem duração, nem ícone. É
comunicada só pelo fade sobre a cor do card. O rótulo brigava com o nome da
cliente e ficava escondido metade das vezes sob um encaixe.

## Pausa clareia, bloqueio hachura

Distinção semântica deliberada (10/08/2026):

| Elemento | Visual | Significa |
|---|---|---|
| **pausa** (`gap`) | faixa mais **clara**, sem listra | "cabe encaixar alguém" |
| **bloqueio manual** | **hachurado**, neutro, sem barra | "indisponível" |

A listra diagonal saiu da pausa porque rachurado lê como área bloqueada — e
pausa é exatamente o contrário.

## O que a agenda NÃO carimba

| status | timeline |
|---|---|
| `confirmed` | nada — estar na agenda já diz que existe |
| `completed` | nada — é o estado natural de um passado |
| `pending` | nada, por enquanto — o produto não definiu o significado |
| `no_show` | selo de texto, só quando marcado explicitamente |
| `cancelled` | não renderiza (filtro de **render**, não de dado) |

**Nada de dot sem rótulo.** A bolinha de status saiu: aparecia em 100% dos
cards quase sempre na mesma cor — legenda que não existia em lugar nenhum.

## Pager de dias — arrasto horizontal

Não é "swipe detectado → toca animação". O trilho acompanha o dedo **1:1** e só
decide no soltar. Cinco coisas sustentam isso e mexer numa quebra as outras:

1. `touch-action: pan-y` na `.timeline` — dispensa `preventDefault`
2. três páginas irmãs, já desenhadas, num trilho
3. a data só muda no **commit**
4. direction lock antes de qualquer movimento (`PAGER_INTENT_PX` = 8px)
5. commit por distância **ou** velocidade, na mesma direção

Detalhe completo (e as armadilhas de rAF) em `app/CLAUDE.md` §"Agenda v2".

## Cabeçalho: compacto, sem colapso

**Não existe estado expandido/colapsado.** Houve tentativa (03–05/08) de
cabeçalho que encolhia ao rolar; foi removida por inteiro a pedido do Raphael.
Se a ideia reaparecer, **já foi tentada e descartada**.

Medido: a grade começa a ~21% da altura da tela (era ~39%).

## Cor por categoria, não por profissional

Com só a Juliane ativa, `colorForStaff()` devolvia a mesma cor pra tudo — a
agenda inteira já era monocromática. `colorForService()` usa paleta fixa pelas
5 categorias reais, evitando o vermelho de alerta.
Ver [[ADR 0004 - Cor por categoria de servico]].

## Source of truth

`app/CLAUDE.md` §"Agenda v2 — geometria da grade", §"Status na timeline",
§"Cabeçalho da Agenda". Âncoras: `renderAgenda()`, `buildAgendaGrid()`,
`layoutAppts()`, `segmentsOf()`, `bindAgendaPager()`.

## Links

[[Schedule Availability]] · [[Payments - Stripe]] (hold não aparece aqui) ·
[[Product Backlog]] (Appointment Detail) · [[Handoff 2026-08-15 Agenda V2]]
