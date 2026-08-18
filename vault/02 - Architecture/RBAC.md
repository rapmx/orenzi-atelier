# RBAC — owner e staff

**Estado: V1 em produção desde 18/08/2026.**

```
RBAC V1

owner:
  operational + managerial

staff:
  operational

owner-only capabilities:
  Insights
  Financeiro
```

Duas afirmações que valem como regra, não como detalhe de implementação:

```
staff is NOT scoped to own appointments.
```

```
operational data entry may write values later consumed by Financeiro;
this does not grant access to Financeiro.
```

## Por que a assistente opera tudo

A pessoa que provavelmente vai usar o sistema no dia a dia é a assistente,
não a Juliane. Um RBAC que a limitasse aos próprios atendimentos tornaria o
produto inútil para quem mais o usa. A restrição real é **gerencial**: ela
não vê a análise do negócio.

Por isso **não existe** `appointment.staff_id = current_staff_id()` em
policy nenhuma, e `current_staff_id()` existe só como peça de futuro (papéis
tipo `professional`), sem consumidor hoje.

## Onde o papel vive

`app_accounts` — `user_id`, `staff_id` (nullable), `role` (`owner`|`staff`),
`active`, timestamps. **Sem grant para `anon`/`authenticated`**: a tabela não
existe pela superfície do PostgREST. Quem a lê são três funções
`SECURITY DEFINER STABLE` com `EXECUTE` só para `authenticated`:
`current_app_role()`, `is_owner()`, `current_staff_id()`.

É isso que impede auto-promoção. `staff.role` (`Boss`, `Colorista`,
`Recepção`) é **rótulo de cargo** e não autoriza nada — a tabela `staff` é
legível por `anon` e não serve de fonte de permissão. Ver [[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]].

Conta autenticada sem linha em `app_accounts`, ou com `active = false`, não
tem acesso: **fail closed**, nunca `staff` por padrão.

## Classificação dos dados

```
individual appointment value       = operational
aggregated customer monetary value = managerial
```

A linha divisória é **agregação**, não "ser dinheiro". O preço de um
atendimento é o que se cobra da cliente na cadeira — operacional, e é da
assistente. Somar os atendimentos dela ao longo do tempo é leitura de
negócio. É a mesma fronteira do `final_price`: registrar o valor é
operacional, analisar o acumulado não é.

| Dado | Classificação |
|---|---|
| Home (panorama, ritmo, oportunidade, tendência) | operacional — não tem número monetário nenhum |
| Preço de um atendimento (timeline e bloco de valor) | operacional |
| `final_price` e a RPC que o escreve | operacional |
| "Total investido", `€ gasto` no cartão da lista, ordenação "Maior gasto" | gerencial — **owner-only desde 18/08/2026** |
| Insights (receita, ticket, €/h, sugestões) | gerencial |
| Financeiro inteiro (valor da agenda, ticket, mix, evolução) | gerencial — **owner-only desde 18/08/2026**, tela e rota |
| `booking_visits` | gerencial, e **exclusivo da Insights** — fechado na RLS |
| Escrita de `services`/`staff`/`staff_services` | administrativo — não existe tela no painel |

## O limite conhecido da proteção da Insights

A Insights **não tem fonte de dados própria**: calcula no browser sobre
`appointments` e `services`, que a Agenda, a Home e o perfil da cliente
precisam ler. As opções eram:

1. restringir `total_price`/`final_price` para `staff` — protegeria a tela e
   **quebraria** o registro do valor final, que é operacional e é dela;
2. RPC agregada `owner-only` para a Insights — **não acrescenta proteção**
   enquanto as linhas operacionais seguem legíveis; seria indireção;
3. capability guard (UI + roteador) + RLS no que é exclusivo da Insights.

Escolhida a 3. Consequência aceita: uma assistente com devtools consegue
recomputar receita a partir de dados operacionais. Fechar isso custaria o
operacional, e a decisão de produto foi explícita — não sacrificar o
operacional para proteger uma tela.

`booking_visits` foi o único dado que dava para fechar sem custo: só a
Insights o consome (bloco "Canais"). Policy de SELECT agora é `is_owner()`.

## Navegação

| Papel | Rodapé real desde 18/08/2026 |
|---|---|
| owner | Início · Agenda · Clientes · Insights · Financeiro · Estoque |
| staff | Início · Agenda · Clientes · Estoque |

Esta é a **navegação final aprovada**, e ela entrou junto com a tela do
Financeiro — não antes. A reordenação estava aprovada desde 17/08 e foi
segurada de propósito: aba vazia é promessa falsa. Questionário continua fora
do rodapé.

O rodapé é desenhado por capability (`aplicarNavPorPapel()`), não por papel:
a aba que o papel não alcança sai da tela, sem nenhuma condicional nova.

## Regra para o Financeiro

Qualquer backend novo do Financeiro nasce com `is_owner()` como requisito —
policy, RPC ou Edge Function. Não é retrofit.

O **Financeiro V1 (18/08/2026) não precisou de backend nenhum** — nenhum grant,
nenhuma RPC, nenhuma view. Calcula no browser sobre `appointments` e
`services`, que a Agenda e a Home já leem. Foi decisão explícita **não** abrir
`appointment_services` (hoje `REVOKE ALL` para o browser) só para o ranking
por serviço fechar: não se abre superfície de dado por conveniência de tela.
Ver [[Financeiro]] e [[ADR 0016 - Financeiro V1 e o valor da agenda]].

## Evolução

`ROLE_CAPABILITIES` é declarativo justamente para `manager`,
`receptionist` e `professional` entrarem como linha nova em vez de caçada
por condicionais. `current_staff_id()` já existe para o dia em que
`professional` precisar de escopo por linha.

## Links

[[Supabase e Database]] · [[Insights]] · [[Financeiro]] ·
[[Clientes]] · [[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]]
