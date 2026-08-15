# ADR 0003 — VIP é manual, não derivado

- **Data:** 03/08/2026
- **Status:** aceito
- **Decisor:** Raphael (decisão D3 do roadmap Fase 3)

## Contexto
`clientStats()` derivava VIP de `visits >= 5`.

## Decisão
Coluna `clients.vip boolean default false`, alternada à mão no perfil.
**Ninguém foi migrado** — nasceu `false` para todo mundo ("começar do zero").

## Alternativas consideradas
- **Migrar quem já tinha 5+ visitas** — descartado: carimbaria como VIP gente
  que a Juliane nunca escolheu, e desfazer isso é mais trabalhoso que marcar.
- **Manter derivado, com override** — descartado: dois significados de VIP
  convivendo é pior que um só, mesmo que manual.

## Consequências
VIP passa a significar "a Juliane decidiu", não "o sistema contou".
`clientStats()` lê `client.vip` direto. O toggle grava com `.select()` no fim,
como toda escrita autenticada.

## Reversibilidade
Trivial: a coluna continua lá; voltar a derivar é mudar uma leitura.

## Links
[[Clientes]] · [[ADR Index]]
