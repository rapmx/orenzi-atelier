# Product Scope

**O que é.** O Orenzi é o sistema de agendamento de **um salão**, para **uma
profissional**, com **uma cliente pagante** — a Juliane. Não é um SaaS.

## O que está dentro

- landing pública bilíngue (PT/EN)
- agendamento self-service pela cliente do salão, com sinal
- remarcação e cancelamento pela cliente, por link
- painel de gestão para a Juliane: Início, Insights, Agenda, Clientes, Estoque,
  Questionário
- questionário de consulta capilar, em 3 idiomas

## O que está fora, e por decisão

| Fora | Por quê |
|---|---|
| Multi-estabelecimento | produto é single-salon nesta fase — ver [[ADR 0007 - Expediente duplicado entre JS e SQL, aceito]] |
| Tema escuro | recusado pela cliente — [[ADR 0001 - Tema escuro recusado]] |
| Build / framework / npm | [[ADR 0002 - Sem build, sem framework]] |
| Automação a partir do questionário | [[ADR 0010 - Questionario e consulta manual]] |
| No-show automático | "o horário passou" nunca vira `no_show` |
| Refund automático | [[Payments - Stripe]] |
| Funcionalidade inexistente na UI | "Importar contatos", "Escanear código de barras" saíram |

## Princípio de produto que se repete

**O app não carimba o que é normal.** A agenda não mostra selo de
"Confirmado" (estar na agenda já diz isso), não pinta o vazio (a ausência de
card já significa disponibilidade), e não rotula a pausa (o fade já comunica).

Informação que aparece por acaso é pior que informação nenhuma.

## Fase atual

Ver [[Estado Atual do Produto]]. Resumo: as frentes grandes estão fechadas;
o que resta é Splash, Login, telas maduras e polish. **Product Map / SaaS só
depois do Orenzi finalizado.**

## Links

[[Orenzi Overview]] · [[Juliane - Client 01]] · [[Estado Atual do Produto]] ·
[[Product Backlog]]
