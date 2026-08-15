# Vault do Orenzi

Camada de **contexto humano** do projeto: decisões, rationale, pendências e
handoffs. Vive dentro do repositório de propósito — assim viaja no git e as
sessões futuras (Claude Code e Claude Chat) alcançam sem depender do Desktop.

**Como abrir no Obsidian:** `Open folder as vault` apontando para esta pasta
(`PROJECT ORENZI/vault`). Há uma nota-ponteiro em
`Desktop/Obsidian/Second brain/01 - Projects/Orenzi.md`.

## O que entra aqui e o que não entra

| Entra | Não entra |
|---|---|
| Por que uma decisão foi tomada | Como o código está implementado |
| O que está pendente e de quem depende | Trechos longos de código |
| Estado de cada frente do produto | Regras de UI/DS (isso é `docs/`) |
| Handoffs de milestone | Documentação de banco linha a linha |

**Regra de ouro:** se algo já está bem explicado em `app/CLAUDE.md` ou num doc
de `docs/`, aqui fica só o **resumo + a decisão + o link**. Nunca a cópia.

## Estrutura

| Pasta | O que é |
|---|---|
| `00 - Start Here` | por onde começar: visão, estado atual, fonte de verdade, protocolo |
| `01 - Product` | uma nota por frente de produto |
| `02 - Architecture` | como o sistema é montado |
| `03 - Decisions` | ADRs — decisões congeladas |
| `04 - Backlog` | pendências, dívida, bloqueadores |
| `05 - Handoffs` | resumo por milestone entregue |

## Manutenção

Atualizar quando uma **decisão** muda, não quando uma linha de código muda.
Vault desatualizado é pior que vault inexistente, porque é lido com confiança.

Ver [[Source of Truth]] e [[Protocolo de Contexto]].
