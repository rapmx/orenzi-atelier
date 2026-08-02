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

## Fase 2 — Agenda — ✅ concluída (02/08/2026)

- [x] Fontes e UI no padrão de Início/Insights — `.timeline` ganhou fundo
      `--color-surface` + borda + radius 22px (era cinza chapado sem borda);
      `.week-day` e `.timeline-appt` já estavam próximos do padrão.
- [x] Cor do booking por **categoria do serviço**, não por profissional (D1:
      por categoria, confirmado). Achado no caminho: com só a Juliane
      atendendo, a cor por profissional (`colorForStaff`) sempre devolvia a
      mesma cor pra tudo — a agenda inteira já estava monocromática, não só
      "com a cor errada". Nova `colorForService()`, paleta fixa pelas 5
      categorias reais (Alisamento, Coloração, Corte, Outros, Tratamentos),
      evita o vermelho de `--color-accent-2` (reservado pra alerta). Mesma
      correção aplicada em Início → "Próximos horários", que tinha o mesmo
      defeito.
- [x] Animação de toque nos cards de dia da semana, nos bookings e no botão +
      (`scale()` rápido no `:active`, com `prefers-reduced-motion` respeitado)
- [x] Slide da grade ao trocar de dia (direção depende de ir pra frente ou
      pra trás na data), pop-up no modal de novo agendamento (modelo: balão
      de ajuda de Insights) com a UI interna também no padrão de cartão, e
      barra de rolagem da agenda que só aparece durante o toque
- [x] Refino "estilo Apple Calendar" (a partir de print de referência):
      grade sem card (linhas quase invisíveis), título de data por extenso,
      linha do horário atual (cor de marca, não vermelho, atualiza sozinha),
      botão "Hoje" fixo substituindo o link antigo, header com mais respiro,
      prevWeek/nextWeek/Hoje deslizando igual ao toque no dia. De brinde:
      corrigido "Agosto **De** 2026" (bug de `text-transform: capitalize`
      pré-existente no mês do cabeçalho e do calendário)

Achado pré-existente, não relacionado a esta fase: `painel_demo.html` solta 2
erros no console já ao carregar (antes de qualquer interação), confirmado por
`git stash` que já existia antes de hoje. Não afeta a tela — não investigado
a fundo, fora do escopo desta lista.

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
