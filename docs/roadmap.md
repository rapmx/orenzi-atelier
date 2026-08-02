# Roadmap — padronização visual + melhorias (02/08/2026)

Lista que o Raphael trouxe pra levar Agenda, Clientes, Estoque e Questionário
ao mesmo padrão de Início/Insights, mais alguns comportamentos novos. Ordenado
por dependência, não pela ordem em que ele escreveu.

## Fase 0 — Padrão visual — ✅ concluída (02/08/2026)

Modelo extraído de `.appt-modern-card` (card de agendamento da Home) e
generalizado em `.list-row`: fundo `--color-surface` + borda
`--color-divider` + `border-radius: 16px` + leve elevação ao toque. Cor de
alerta fixada no par `--color-accent-2-100`/`--color-accent-2-700`, o mesmo
vermelho que "Agenda praticamente lotada" já usa. Documentado em
`app/CLAUDE.md`, seção "Padrão visual".

## Fase 1 — Estoque — ✅ concluída (02/08/2026)

- [x] Aplicar o padrão visual (`.list-row.stock-row`)
- [x] Destacar item em alerta de mínimo (fundo tingido, borda grossa, título e
      quantidade em vermelho, tag "Repor")

## Fase 2 — Agenda — em espera de decisão

- [ ] Fontes e UI no padrão de Início/Insights
- [ ] Cor do booking por **serviço**, não por profissional (só a Juliane
      atende, então a cor por profissional não informa nada hoje)
- [ ] Animações de transição em botões específicos

**Travas:**
- **D1 — por que cor os bookings?** 15 serviços em 5 categorias. Cor por
  categoria (5 cores, mais fácil de diferenciar de relance) vs. cor fixa por
  serviço (mais uma coluna + tela de configuração). Recomendação: por
  categoria.
- **Quais botões** entram na animação de transição — o Raphael vai apontar
  2–3 exemplos.

## Fase 3 — Clientes — em espera de decisão

- [ ] Padrão visual na lista e no perfil da cliente
- [ ] Histórico de visitas: só as 3 últimas + botão "ver mais"
- [ ] Tag VIP manual (hoje é automática: `visits >= 5`,
      `painel.html` função `clientStats()`)
- [ ] Valor do atendimento editável por booking (hoje vem só de
      `services.price`)

**Travas:**
- **D2 — valor editável.** Requer coluna nova (`appointments.price`, vazia =
  usa o preço do serviço). Maior alcance da lista: toda conta de receita
  (gasto da cliente, gráfico de evolução, indicadores de Insights) passa a
  ler `a.price ?? s.price`. Fazer por último dentro da fase e conferir os
  números de Insights antes/depois.
- **D3 — VIP manual.** Requer coluna nova (`clients.vip boolean`). Falta
  decidir: migrar as clientes que hoje são VIP automática (5+ visitas) como
  VIP já marcada, ou todo mundo começa sem tag e a Juliane marca do zero?

## Fase 4 — Questionário: tela de idioma — em espera de decisão

Primeira tela ao selecionar a cliente: "Selecione seu idioma" com animação
alternando a frase em pt-BR/en/es, e as três bandeiras (Brasil, Irlanda,
Espanha) como botão.

**Trava — D4:** a escolha traduz o questionário inteiro (todas as perguntas e
opções nos 3 idiomas) ou é só a tela de abertura, gravando o idioma escolhido
pra referência? A primeira opção é bem maior.

## Lembrete permanente

Toda mudança visual entra em `app/painel.html` **e** `app/painel_demo.html` —
são espelhos, só o stub do Supabase no topo do demo difere.
