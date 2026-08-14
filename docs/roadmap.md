# Roadmap — padronização visual + melhorias (02/08/2026)

Lista que o Raphael trouxe pra levar Agenda, Clientes, Estoque e Questionário
ao mesmo padrão de Início/Insights, mais alguns comportamentos novos. Ordenado
por dependência, não pela ordem em que ele escreveu.

## 👉 Estado atual (fim da sessão de 03/08/2026) — comece por aqui

**Fases 0, 1, 2 e 3 concluídas.** Fase 3 (Clientes) fechou com D2 (valor
editável) adiado — **não agora** — e D3 (VIP manual) resolvido como
"começar do zero": ninguém migrado, `clients.vip` nasceu `false` pra todo
mundo. Tudo já commitado e no ar.

**Fase 4 (Questionário) concluída em 15/08/2026** — ver seção abaixo. D4
resolvido: traduz o questionário inteiro nos 3 idiomas.

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
- [x] Segunda leva — refino premium de UX/microinterações (prompt mais
      detalhado, mesmo dia): faixa de dias "viva" (seleção desliza porque os
      botões deixaram de ser recriados a cada toque), dois níveis de slide
      (semana inteira vs. só o dia, ver `app/CLAUDE.md`), scroll inteligente
      (abre perto do horário relevante), linha do horário atual com
      transição contínua + pulso de destaque no botão "Hoje", hierarquia da
      timeline (hora discreta, evento sem sombra e com mais padding),
      cabeçalho+faixa mais coesos (menos espaço entre eles, mais no título
      de data), toque com retorno elástico discreto. `HOUR_HEIGHT` 64→68.
      Achado e corrigido no caminho: os botões de dia ficavam com uma
      referência velha de `state.agendaDate` depois do primeiro toque leve
      (não são reamarrados nesse caminho) — o segundo toque em sequência
      podia virar no-op silencioso.
- [x] Campo "Horário" do modal de novo agendamento virou dropdown com os
      horários livres (antes era texto digitado). Mesma regra do
      `agendar.html`: expediente + grade de 30min, só bloco de trabalho
      ocupa (pausa fica livre, permite encaixe). Recalcula sozinho quando
      serviço/profissional/data mudam.
- [x] Revisão de pixel (medida no navegador, não só lida no CSS): `.fab`
      e `.fab-today` tinham alturas diferentes (54 vs 44px) apesar de
      ficarem nas pontas opostas da mesma linha — igualado. Espaço antes
      do rótulo "Cliente" no modal era ~5px menor que antes de "Serviço" —
      igualado ajustando `.toggle-row`. `tabular-nums` nos dígitos de hora
      (grade + linha do horário atual) pra não "tremer" a cada atualização.
- [x] Segunda revisão a partir de print do Apple Calendar (layout, não
      identidade visual): mês em pílula com setas dentro; `+` saiu do FAB
      flutuante e virou squircle no `.day-nav` (FAB fixo agora é só do
      Estoque); "Hoje" trocou de preenchido pra contornado neutro; hora com
      `:00`; janela do desenho ampliada pra 5h-21h (não mexe no expediente
      real nem em ocupação); ícones nas 6 abas do rodapé. Achado medindo:
      linha do horário atual tinha 9,6px de diferença do horário real —
      corrigido com `transform:translateY(-50%)`.

Achado pré-existente, não relacionado a esta fase: `painel_demo.html` soltava 2
erros no console já ao carregar (antes de qualquer interação), confirmado por
`git stash` em 02/08 que já existia antes daquele dia. Nunca foi investigado a
fundo — sem mensagem nem stack registrados. Retestado em 06/08 (carga inicial,
as 6 abas, wizard completo, aba nova sem cache): **não reproduzido**. Fica
registrado como não confirmado, não como baseline aceita — se reaparecer,
precisa de mensagem/stack pra virar achado de verdade.

## Fase 3 — Clientes — ✅ concluída (03/08/2026)

- [x] Padrão visual na lista e no perfil da cliente — `.client-list-card`
      (lista) e `.history-row` (histórico de visitas, dentro do perfil)
      migraram pro padrão `.list-row` (surface + borda + radius 16px), mesmo
      modelo de Estoque/Agenda. `.stat-row` e `.profile-actions a`, que
      também eram cinza chapado sem borda, entraram na mesma leva.
- [x] Histórico de visitas: só as 3 últimas + botão "ver mais" —
      `HISTORY_PREVIEW_COUNT`, estado `state.clientHistoryExpanded` (reseta
      ao trocar de cliente).
- [x] Tag VIP manual — coluna nova `clients.vip boolean default false`
      (D3: começar do zero, ninguém migrado). `clientStats()` não deriva
      mais de `visits >= 5`; lê `client.vip` direto. Botão clicável no
      perfil (`#vipToggleBtn`) alterna e grava com `.select()` no fim
      (mesmo padrão de escrita autenticada do resto do app).
- [ ] Valor do atendimento editável por booking — **adiado (D2: não agora)**.
      Fica registrado pra quando entrar na pauta: requer coluna nova
      `appointments.price` (vazia = usa o preço do serviço), e o maior
      alcance da lista — toda conta de receita (gasto da cliente, gráfico de
      evolução, indicadores de Insights) passaria a ler `a.price ?? s.price`.

## Fase 4 — Questionário V2 — ✅ concluída (15/08/2026)

- [x] **D4 resolvido: traduz o questionário inteiro.** pt-BR, en e es cobrem
      perguntas, opções, helpers, botões, revisão e sucesso. O valor gravado
      continua canônico em português — a tradução é só de apresentação.
- [x] Tela de abertura com a saudação alternando (Bem-vinda / Welcome /
      Bienvenida), movimento vertical, `prefers-reduced-motion` mostra as
      três paradas. **Sem bandeiras** — idioma não é país (mudança em
      relação ao esboço original desta fase).
- [x] Redesign completo sobre o DS: opções em cartão no lugar de `<select>`,
      anatomia de FullScreenSheet, `100dvh`, safe areas, progresso "N de 7".
- [x] Voltar, sair com confirmação, revisão antes de salvar, CTA que diz
      "Salvar questionário" (o `✕` que gravava morreu).
- [x] Etapa nova de referências visuais (até 3, placeholders declarados até
      a Juliane mandar as fotos).
- [x] Relatório do perfil com data, idioma e referências; estado vazio
      virou tela.
- [ ] **Etapa B — migration pendente de aplicar** (`language`,
      `reference_images`, índice, REVOKE de `anon`). O arquivo está em
      `supabase/migrations/20260815120000_questionnaire_v2_language_and_references.sql`.
      A interface funciona sem ela e grava as seis respostas antigas; os
      dois campos novos só passam a persistir depois de aplicada.

**Fora do escopo por decisão de 15/08:** alerta automático, integração com
Appointment/Agenda, recomendação, expiração/revalidação, histórico
navegável, multi-select das perguntas químicas, edição posterior.

## Lembrete permanente

Toda mudança visual entra em `app/painel.html` **e** `app/painel_demo.html` —
são espelhos, só o stub do Supabase no topo do demo difere.
