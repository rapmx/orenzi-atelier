# Clientes

**Estado: Fase 3 do roadmap visual concluída em 03/08/2026. PR2 do Design
System entregue** (com 5 bugs corrigidos no caminho).

## Decisões atuais

**VIP é manual, não derivado.** `clients.vip boolean default false`.
`clientStats()` não deriva mais de `visits >= 5` — lê `client.vip` direto.
Ninguém foi migrado: nasceu `false` para todo mundo, de propósito
("começar do zero"). Ver [[ADR 0003 - VIP manual]].

**Histórico mostra só as 3 últimas + "ver mais"**
(`HISTORY_PREVIEW_COUNT`, `state.clientHistoryExpanded`, reseta ao trocar de
cliente).

**Dedup de telefone é do banco, não do JS.** A regra real é a RPC
`find_or_create_client` + `normalize_ie_phone` no Supabase. Não existe nada em
JS fazendo isso — não procure.

## Armadilha de foco

A busca de cliente **não passa pelo render da tela inteira**. Re-renderizar
destruiria o input sob o dedo e perderia o foco no meio da digitação. Mesmo
padrão em Estoque e no Questionário (`quizPaintClientList()`).

## Adiado

**Valor do atendimento editável por booking** — D2: *não agora*. Fica
registrado: exigiria coluna nova `appointments.price` (vazia = usa o preço do
serviço), e o alcance é o maior da lista — toda conta de receita (gasto da
cliente, gráfico de evolução, indicadores de Insights) passaria a ler
`a.price ?? s.price`.

Ver [[Product Backlog]].

## Não implementado

**Client History** — regra escrita em 10/08, nada construído:

- `cancelled` permanece no banco e **deve** aparecer no histórico com indicação
  "Cancelado" — só não aparece na agenda operacional;
- `no_show` permanece registrado quando marcado explicitamente;
- **no-show automático não foi aprovado** e não deve ser implementado por conta
  própria;
- o fluxo para marcar no-show (quem marca, de onde, com que confirmação) ainda
  será definido.

Toca a auditoria de **Appointment Detail** — ver [[Product Backlog]].

## Source of truth

`app/CLAUDE.md` · `docs/roadmap.md` Fase 3.
Âncoras: `renderClients()`, `renderClientDetail()`, `clientStats()`,
`clientsWithStats()`.

## Links

[[Questionario]] · [[Agenda]] · [[Product Backlog]] · [[Insights]]
