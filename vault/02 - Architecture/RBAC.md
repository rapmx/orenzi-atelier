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

| Dado | Classificação |
|---|---|
| Home (panorama, ritmo, oportunidade, tendência) | operacional — não tem número monetário nenhum |
| Preço de um atendimento (timeline e bloco de valor) | operacional |
| `final_price` e a RPC que o escreve | operacional |
| "Total investido" no perfil | gerencial de borda — mantido para os dois em V1 |
| Insights (receita, ticket, €/h, sugestões) | gerencial |
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

| Papel | Rodapé real hoje |
|---|---|
| owner | Início · Insights · Agenda · Clientes · Estoque |
| staff | Início · Agenda · Clientes · Estoque |

A nav aprovada para o futuro (`Início · Agenda · Clientes · Insights ·
Financeiro · Estoque`) **não** foi aplicada: o Financeiro não existe no app
real, e aba vazia é promessa falsa. A reordenação entra junto com a tela.
Questionário continua fora do rodapé.

## Regra para o Financeiro

Qualquer backend novo do Financeiro nasce com `is_owner()` como requisito —
policy, RPC ou Edge Function. Não é retrofit.

## Evolução

`ROLE_CAPABILITIES` é declarativo justamente para `manager`,
`receptionist` e `professional` entrarem como linha nova em vez de caçada
por condicionais. `current_staff_id()` já existe para o dia em que
`professional` precisar de escopo por linha.

## Links

[[Supabase e Database]] · [[Insights]] · [[Financeiro - futuro]] ·
[[Clientes]] · [[ADR 0015 - RBAC V1 - staff opera tudo, owner ve o negocio]]
