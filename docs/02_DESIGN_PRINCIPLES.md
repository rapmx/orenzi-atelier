# 02 — Design Principles

**Versão 1.0 · 03/08/2026**

Catorze princípios de decisão. Não são valores abstratos: cada um resolve uma
discussão real que aparece toda semana no Orenzi.

**Como usar:** quando duas soluções parecem igualmente válidas, procure o
princípio que se aplica. Se dois princípios entram em conflito, vale a ordem
desta lista — o de número menor ganha.

| # | Princípio | Domínio |
|---|---|---|
| 1 | Conteúdo Antes de Moldura | telas operacionais |
| 2 | O Silêncio é o Padrão | alertas, status |
| 3 | Espaço é Estrutura | listas, cards |
| 4 | Uma Ação Primária | toda tela |
| 5 | Contexto Antes da Ação | ações críticas |
| 6 | Revelação Progressiva | listas, formulários |
| 7 | Estado em Um Olhar | dados, status |
| 8 | Números Honestos | métricas, insights |
| 9 | Continuidade Acima de Surpresa | navegação |
| 10 | Vazio Que Ensina | estados vazios |
| 11 | O Erro é Nosso | erros |
| 12 | O Polegar Manda | mobile-first |
| 13 | Reuso Antes de Invenção | escalabilidade |
| 14 | Padrão Antes de Caso Especial | escalabilidade |

---

## 1. Conteúdo Antes de Moldura

> **A informação é o produto. O que a envolve é custo.**

**Explicação.** Card, borda, sombra, cabeçalho e ícone não são conteúdo — são
moldura. Toda moldura consome espaço vertical, que no celular é o recurso mais
escasso do produto. Moldura só se justifica quando separa duas coisas que
seriam confundidas se ficassem juntas.

**Por que existe.** O caminho fácil para organizar uma tela é colocar cada
assunto em uma caixa. O resultado é uma tela de caixas onde tudo tem o mesmo
peso e nada se destaca — exatamente a densidade de ERP que o Orenzi recusa
([01 §7](01_PRODUCT_LANGUAGE.md)).

**Como aplicar.**
1. Comece sem nenhum card. Só texto, hierarquia tipográfica e espaço.
2. Adicione separação por espaçamento.
3. Adicione título de seção se o espaço não bastou.
4. Só então considere um card — e só se o bloco for tocável ou realmente
   independente do vizinho.

**Quando não aplicar.** Quando o bloco é um alvo de toque (um card de cliente
precisa parecer clicável), quando ele flutua sobre outro conteúdo (bottom
sheet, modal), ou quando ele carrega um estado próprio que precisa de fundo
tingido (produto em alerta de estoque).

**Exemplo correto.** O perfil da cliente usa `.profile-section` com 32px entre
blocos e um título por seção. Não há caixa em volta de nada. A hierarquia vem
do espaço.

**Contraexemplo.** A versão anterior do mesmo perfil: cada grupo de campos
dentro de um card, cards dentro da tela, tudo com a mesma borda. Nada tinha
peso porque tudo tinha moldura.

**Perguntas de revisão.**
- Este card separa duas coisas que seriam confundidas sem ele?
- Removendo a borda e o fundo, a tela piora ou melhora?
- Quantos níveis de caixa existem aqui? Mais de um é sinal de alerta.

---

## 2. O Silêncio é o Padrão

> **O normal não se anuncia. Só o que precisa de atenção aparece.**

**Explicação.** O estado padrão de qualquer elemento é neutro e quieto. Cor de
destaque, badge, negrito e ícone de status são reservados ao que exige uma
decisão da pessoa. Se tudo destaca, nada destaca.

**Por que existe.** Quem usa o Orenzi está trabalhando. Cada elemento que pede
atenção sem merecer custa um segundo e um pouco de confiança. Depois de três
alertas irrelevantes, o quarto — o verdadeiro — é ignorado.

**Como aplicar.**
1. Pergunte: isso exige que a pessoa faça algo? Se não, é neutro.
2. Se exige, escolha o degrau certo: caramelo (atenção) ou vermelho (urgente).
3. Nunca use vermelho para o que apenas é diferente.
4. Contadores só quando o número muda o comportamento de quem lê.

**Quando não aplicar.** Confirmação de sucesso momentânea (toast) é ruído por
definição, e é aceitável — desde que desapareça sozinha e não bloqueie.

**Exemplo correto.** Na lista de estoque, produto com quantidade saudável é uma
linha neutra. Só `baixo`, `crítico` e `sem` ganham cor, borda tingida e ordem
de prioridade.

**Contraexemplo.** Colorir todos os produtos por categoria "para ficar mais
visual". A cor deixa de significar estado e passa a significar nada.

**Perguntas de revisão.**
- Se estivesse tudo normal, esta tela estaria calma?
- Este destaque pede uma ação, ou só informa?
- Quantas cores não-neutras existem simultaneamente na tela?

---

## 3. Espaço é Estrutura

> **Separar com espaço antes de separar com linha, e com linha antes de caixa.**

**Explicação.** Existe uma escada de recursos de separação, do mais barato ao
mais caro: espaço → hierarquia tipográfica → divisor → borda → card → cor de
fundo. Sempre use o degrau mais baixo que resolve.

**Por que existe.** Espaço não tem custo cognitivo. Todo recurso acima dele
adiciona um elemento que a pessoa precisa interpretar.

**Como aplicar.** Aumente o espaçamento antes de adicionar qualquer coisa.
Blocos de assunto diferente pedem espaço grande (32px); itens da mesma família
pedem espaço pequeno (8px). Densidade uniforme é o sintoma de que o espaço não
está sendo usado como estrutura.

**Quando não aplicar.** Quando o espaço necessário empurraria conteúdo crítico
para fora da primeira dobra. Aí o divisor é preferível ao scroll.

**Exemplo correto.** O perfil da cliente separa Header, Métricas, Diagnóstico,
Fotos, Serviços e Histórico com 32px e um título — sem uma única borda entre
seções.

**Contraexemplo.** Uma lista com 12px entre todos os elementos, de todos os
tipos. Sem ritmo, a pessoa lê tudo linearmente em vez de escanear.

**Perguntas de revisão.**
- Os espaçamentos desta tela têm pelo menos três tamanhos distintos?
- O maior espaço está entre os dois assuntos mais diferentes?

---

## 4. Uma Ação Primária

> **Cada tela tem uma ação óbvia. As outras são secundárias e parecem isso.**

**Explicação.** Uma tela pode oferecer muitas ações, mas só uma pode ter
tratamento de destaque. As demais são contornadas, fantasmas ou apenas texto.

**Por que existe.** Duas ações com o mesmo peso visual forçam uma decisão que
não deveria existir. É a diferença entre uma ferramenta que guia e um formulário
que interroga.

**Como aplicar.**
1. Identifique a ação que 80% das pessoas fará nesta tela.
2. Ela recebe o tratamento primário (preenchido, cor de marca).
3. Tudo mais é secundário (contornado) ou terciário (texto).
4. Ação destrutiva nunca é primária — ver princípio 5.

**Quando não aplicar.** Escolhas genuinamente paralelas e mutuamente exclusivas
— "Entrada" e "Saída" de estoque têm o mesmo peso porque a pessoa já sabe qual
quer antes de abrir a folha.

**Exemplo correto.** Na Agenda, o `+` é a única ação preenchida com cor de
marca. "Hoje", no lado oposto, é contornado neutro — é navegação, não CTA.
Essa distinção foi uma correção consciente.

**Contraexemplo.** "Hoje" e `+` os dois preenchidos em caramelo. A pessoa
precisa ler os dois para saber qual é a ação de criar.

**Perguntas de revisão.**
- Qual é a ação primária desta tela? (Se a resposta demora, há um problema.)
- Existe mais de um botão preenchido visível ao mesmo tempo?

---

## 5. Contexto Antes da Ação

> **Nada irreversível acontece sem que a pessoa veja exatamente o que vai
> mudar.**

**Explicação.** Antes de uma ação destrutiva ou cara, a interface mostra o
objeto real — nome, data, quantidade — e nomeia a consequência no próprio
botão.

**Por que existe.** "Tem certeza?" não é confirmação, é ruído. A pessoa clica
"Sim" por reflexo. Confirmação só funciona quando reapresenta o que está em
jogo.

**Como aplicar.**
1. Diga o que será afetado, pelo nome: "Excluir o produto Oxidante 20vol?"
2. Diga a consequência, se não for óbvia: "O histórico de movimentações é
   mantido."
3. O botão nomeia a ação: "Excluir produto", nunca "Confirmar" ou "OK".
4. A ação destrutiva recebe tratamento vermelho e **não** é o botão focado por
   padrão.

**Quando não aplicar.** Ações reversíveis e baratas. Marcar/desmarcar VIP,
alternar um chip de filtro ou mudar quantidade em um passo não pedem
confirmação — pedem feedback imediato.

**Exemplo correto.** Segurar o `−` no estoque acumula na tela e grava uma vez
só ao soltar. A pessoa vê o número descendo antes de qualquer escrita, e um
movimento é registrado no histórico.

**Contraexemplo.** Um `⋯` que abre um menu com "Excluir" a um toque de
distância, sem nome do item e sem etapa intermediária.

**Perguntas de revisão.**
- O botão de confirmação nomeia a ação, ou só concorda?
- A pessoa vê o objeto afetado no momento de decidir?
- Isso é reversível? Se sim, a confirmação é ruído.

Detalhamento de texto em [06 §18–19](06_CONTENT_GUIDELINES.md).

---

## 6. Revelação Progressiva

> **Mostre o que resolve 90% dos casos. O resto fica a um toque.**

**Explicação.** Listas longas abrem parcialmente. Formulários longos se dividem.
Detalhes secundários nascem colapsados. Nada é removido — apenas adiado.

**Por que existe.** A tela de celular é curta e o tempo de quem usa é curto.
Rolagem longa é o custo mais alto que uma interface cobra sem parecer que está
cobrando.

**Como aplicar.**
- Listas de histórico abrem com 3 itens e um "Ver mais (N)" — o número real
  entre parênteses, para a pessoa decidir se vale.
- Blocos de detalhe secundário nascem colapsados, com o cabeçalho sempre
  visível.
- Ao **recolher**, a tela volta ao título da seção. Sem isso, o dedo fica
  apontando para o fim do documento.
- O que está escondido nunca é a ação primária.

**Quando não aplicar.** Quando o item escondido é crítico. Estoque em nível
crítico aparece primeiro e inteiro, nunca atrás de "ver mais".

**Exemplo correto.** Histórico de visitas e movimentações de estoque: 3 itens,
"Ver mais (N)", e o recolher devolve a rolagem ao título.

**Contraexemplo.** Colapsar o resumo de estoque "para a tela ficar mais limpa".
O resumo é a razão de a tela existir.

**Perguntas de revisão.**
- O que está escondido é secundário de verdade?
- A pessoa sabe quanta coisa existe atrás do "ver mais"?
- Recolher devolve a rolagem a um ponto útil?

---

## 7. Estado em Um Olhar

> **Estado se lê sem parar para interpretar — e nunca só por cor.**

**Explicação.** Todo estado é comunicado por pelo menos dois canais
simultâneos: cor **e** texto, ou cor **e** forma. A cor acelera a leitura de
quem a distingue; o texto garante quem não distingue.

**Por que existe.** Requisito de acessibilidade ([07 §2](07_ACCESSIBILITY.md)),
mas também de clareza: "ponto verde" não diz o que significa verde.

**Como aplicar.**
1. Defina o conjunto fechado de estados possíveis. Estoque tem quatro: `sem`,
   `crítico`, `baixo`, `ok`. Cliente tem três: Nova, Ativa, Inativa.
2. Cada estado tem cor **e** rótulo em texto, sempre juntos.
3. Ordene a lista por prioridade de estado quando houver urgência.
4. Cada estado declara apenas suas duas variáveis de cor; ponto, badge, borda e
   ícone leem daí. Mudar um estado é mudar dois valores.

**Quando não aplicar.** Cores de identificação que não são estado — a cor por
categoria de serviço na agenda distingue, não classifica. Nesse caso a cor é
auxiliar e o texto já está presente.

**Exemplo correto.** Lista de clientes: ponto colorido **com o rótulo em texto
ao lado**.

**Contraexemplo.** Ponto colorido sozinho, com legenda em outra parte da tela.

**Perguntas de revisão.**
- Em preto e branco, esta tela ainda comunica os estados?
- Os estados formam um conjunto fechado e documentado?

---

## 8. Números Honestos

> **Todo número na tela é rastreável. Sem dado suficiente, dizemos isso.**

**Explicação.** Métricas derivadas declaram sua origem e seus limites. Quando a
amostra é pequena demais para sustentar uma conclusão, a interface mostra a
ausência de dado — não uma estimativa frágil.

**Por que existe.** Decisões de negócio são tomadas em cima destas telas. Um
número errado uma vez destrói a confiança em todos os outros permanentemente.

**Como aplicar.**
1. Toda métrica derivada tem um mínimo de amostra e uma janela mínima de tempo.
   Abaixo disso, a tela diz "sem histórico ainda".
2. Escolha o denominador certo. Capacidade se mede contra o expediente real e
   só contra profissionais ativas.
3. Números que mudam devem usar dígitos de largura fixa, para não "tremer".
4. Nunca semeie o banco de produção com dado inventado para a tela parecer
   cheia. Dado de demonstração vive só no arquivo de demonstração.

**Quando não aplicar.** Nunca. Este princípio não tem exceção.

**Exemplo correto.** A previsão de consumo do estoque exige um número mínimo de
saídas e uma janela mínima de dias. Sem isso, a tela diz que não há histórico.

**Contraexemplo.** Medir ocupação contra a janela de desenho da agenda em vez
do expediente real. Já aconteceu: um dia com 525 de 540 minutos ocupados
mostrava 19% de ocupação.

**Perguntas de revisão.**
- De onde vem este número? Qual é o denominador?
- O que ele mostra com 1 registro? E com 0?
- Ele pode estar certo e mentir mesmo assim?

---

## 9. Continuidade Acima de Surpresa

> **A pessoa nunca se pergunta de onde veio uma tela nem para onde foi o que
> ela estava fazendo.**

**Explicação.** Transições explicam a relação entre origem e destino. Voltar
restaura exatamente o contexto: busca, filtro, ordenação e rolagem.

**Por que existe.** Perder o lugar em uma lista de 200 clientes depois de abrir
um perfil obriga a refazer trabalho. É o tipo de atrito que faz uma pessoa
parar de usar um recurso.

**Como aplicar.**
1. Direção do movimento carrega significado: avançar entra pela direita, voltar
   sai para a direita.
2. Ao abrir um detalhe, guarde a rolagem da lista. Ao voltar, devolva.
3. Entrar pela navegação principal é entrada nova — aí zerar o contexto é
   correto e intencional.
4. Elemento que existe nas duas telas pode fazer transição compartilhada.
5. Nada que anima ou tem foco sobrevive a um `innerHTML` novo. Busca, dropdown
   e seleção que animam precisam ser atualizados sem redesenhar o container.

**Quando não aplicar.** Quando o contexto anterior é perigoso — depois de
excluir um item, voltar para a posição dele é confuso.

**Exemplo correto.** A Agenda tem dois níveis de deslize: a semana inteira
desliza quando a semana muda; só a grade desliza quando muda o dia dentro da
mesma semana. Cada painel se move quando o que ele mostra realmente mudou.

**Contraexemplo.** Redesenhar a lista inteira a cada tecla digitada na busca. O
campo é recriado, perde o foco e o cursor volta ao começo.

**Perguntas de revisão.**
- Voltando desta tela, o que a pessoa perde?
- A direção do movimento corresponde à direção da navegação?
- Algo que anima está sendo recriado a cada render?

Receitas em [05 — Motion System](05_MOTION_SYSTEM.md); padrões em
[09 — UX Patterns](09_UX_PATTERNS.md).

---

## 10. Vazio Que Ensina

> **Uma tela vazia explica por que está vazia e oferece uma saída.**

**Explicação.** Todo estado vazio tem três partes: o que deveria estar aqui, por
que não está, e a ação que resolve. Vazio por falta de dado e vazio por filtro
são situações diferentes e recebem tratamentos diferentes.

**Por que existe.** Uma tela vazia sem explicação parece defeito. A pessoa fica
sem saber se o sistema falhou ou se ela usou errado.

**Como aplicar.**

| Situação | Tratamento |
|---|---|
| **Nunca teve dado** | Convite: ícone discreto, frase que explica, uma ação primária. |
| **Filtro/busca sem resultado** | Mostra o termo buscado e oferece limpar. Nunca o convite de primeira vez. |
| **Vazio temporário** (dia sem atendimento) | Frase curta e neutra. Sem ícone, sem ação. É informação, não problema. |

**Quando não aplicar.** Quando o vazio é o resultado normal e frequente. Um dia
sem agendamentos não precisa de convite para criar um.

**Exemplo correto.** Fotos do cabelo com zero fotos: ícone de câmera,
"Adicionar fotos", "Arraste ou toque para adicionar". Com uma ou mais, vira
galeria com o botão no fim.

**Contraexemplo.** "Nenhum resultado encontrado" sem mostrar o que foi buscado
e sem botão de limpar.

**Perguntas de revisão.**
- Este vazio é de primeira vez, de filtro, ou normal?
- A pessoa sabe o que fazer depois de ler?

---

## 11. O Erro é Nosso

> **O sistema assume a falha, explica em português e oferece o caminho.**

**Explicação.** Mensagens de erro nunca culpam quem usa, nunca expõem
vocabulário técnico e sempre terminam em uma ação possível.

**Por que existe.** O erro é o momento de menor confiança. Uma mensagem que
culpa ou confunde transforma um problema técnico em um problema de relação.

**Como aplicar.**
1. Descreva o que não aconteceu, não o que a pessoa fez errado.
2. Nada de código, status HTTP, nome de tabela ou stack trace.
3. Ofereça "Tentar de novo" quando for recuperável.
4. Erro de validação aparece **no campo**, não em um alerta no topo.
5. Falha silenciosa é o pior erro possível: se a gravação não aconteceu, a tela
   não pode mostrar sucesso.

**Quando não aplicar.** Nunca suavize a ponto de esconder. Se o dado não foi
salvo, a mensagem tem que dizer isso claramente.

**Exemplo correto.** "Não foi possível salvar o produto. Verifique sua conexão
e tente de novo." + botão "Tentar de novo".

**Contraexemplo.** "Erro ao processar requisição (500)" — culpa disfarçada de
neutralidade, sem saída.

**Perguntas de revisão.**
- Alguém sem conhecimento técnico entende esta frase?
- Ela oferece um próximo passo?
- Existe algum caminho em que a tela mostraria sucesso sem ter gravado?

---

## 12. O Polegar Manda

> **O celular é o produto. Tudo mais é adaptação.**

**Explicação.** Toda decisão é tomada primeiro em 390px de largura, com uma mão,
em pé. Telas maiores recebem o mesmo produto centralizado — não uma versão
espalhada.

**Por que existe.** É a diferença entre uma ferramenta usada durante o trabalho
e um relatório consultado depois. Adaptar do desktop para o celular produz
densidade errada em ambos.

**Como aplicar.**
1. Desenhe em 390px. Valide em 320, 390 e 430px.
2. Ações frequentes ficam na metade inferior da tela.
3. Alvo de toque mínimo de 44×44px, sem exceção — área estendida invisível
   quando o desenho pede um controle menor.
4. No navegador de mesa, o aplicativo inteiro fica centralizado em uma coluna
   fixa. **Isso inclui cabeçalho, rodapé e botões flutuantes**, não só o
   conteúdo.
5. Respeite as áreas seguras do aparelho.

**Quando não aplicar.** Na landing pública, que é uma peça de marketing
legitimamente desktop-first e não faz parte do canvas do aplicativo.

**Exemplo correto.** O padrão já existe no código: um container de largura fixa
posicionado com `left: 50%` e deslocamento de metade da própria largura.

**Contraexemplo.** O estado atual do painel: o conteúdo é centralizado, mas o
cabeçalho, a barra inferior e os botões flutuantes se colam nas bordas da
janela. Corrigir isso é P0 técnico ([08](08_IMPLEMENTATION_RULES.md)).

**Perguntas de revisão.**
- Isto foi desenhado em 390px, ou reduzido de uma tela maior?
- A ação principal é alcançável com o polegar?
- Em 1440px de largura, o aplicativo continua sendo uma coluna?

---

## 13. Reuso Antes de Invenção

> **Antes de criar um componente, procure o que já resolve isso.**

**Explicação.** Um componente novo só se justifica quando nenhum existente
resolve com uma variante. Duplicata não é neutra: ela diverge com o tempo e o
produto passa a ter dois padrões para a mesma coisa.

**Por que existe.** Custo comprovado no próprio Orenzi: hoje existem duas
identidades de botão com o mesmo nome de classe, dois "ver mais" diferentes,
três tipos de chip e quatro raios de card para o mesmo papel visual.

**Como aplicar.**
1. Procure em [04 — Component Library](04_COMPONENT_LIBRARY.md).
2. Se existe algo próximo, proponha uma **variante** dele.
3. Se não existe, proponha o componente pela via de governança
   ([10 §4](10_GOVERNANCE_AND_CHANGELOG.md)) — não crie local.
4. Valor visual novo (cor, raio, sombra, duração) exige aprovação explícita.

**Quando não aplicar.** Quando forçar o reuso destruiria a identidade do caso.
Componentes de produto — o card de agendamento, o item de timeline — podem ter
composição própria; o que eles **não** podem é ter tokens próprios.

**Exemplo correto.** `.list-row` e o card de agendamento compartilham a mesma
regra base de fundo, borda e raio. Mudar o modelo muda a família inteira.

**Contraexemplo.** `.btn-see-more` (pílula com borda) e `.see-more-btn` (texto
com chevron) — mesma função, dois componentes, nascidos em semanas diferentes.

**Perguntas de revisão.**
- Isso já existe com outro nome?
- É componente novo, ou variante de um existente?
- Estou introduzindo algum valor visual que não é token?

---

## 14. Padrão Antes de Caso Especial

> **Cada solução deve sobreviver à mudança de negócio.**

**Explicação.** O Orenzi vai além de salão ([01 §4](01_PRODUCT_LANGUAGE.md)).
Um padrão que depende de uma regra exclusiva de salão vira dívida no dia em que
o produto atender outro ramo.

**Por que existe.** É mais barato manter a fronteira desde já do que separar
depois de dez telas construídas em cima da suposição errada.

**Como aplicar.**
1. Separe **conceito** de **vocabulário**. "Pessoa atendida" é conceito;
   "cliente" é a palavra deste ramo.
2. Regras de domínio ficam em constantes nomeadas, nunca espalhadas na tela.
3. Listas de opções que vêm de dados reais nascem dos dados, não de listas
   fixas — categorias fixas viram filtros que nunca encontram nada.
4. Um valor de domínio nunca é duplicado entre telas. Se for inevitável, é
   dívida registrada e documentada.

**Quando não aplicar.** Quando generalizar hoje custa caro e o segundo caso de
uso é hipotético. Nesse caso: resolva específico, mas **isole** — nomeie a
constante e concentre a regra em um lugar.

**Exemplo correto.** Os chips de categoria do estoque nascem do banco. As
categorias reais não eram as previstas; chip fixo teria virado filtro morto.

**Contraexemplo.** O expediente duplicado entre a página da cliente e o painel.
Mudar num e esquecer o outro produz overbooking silencioso — a maior dívida
conhecida do projeto.

**Perguntas de revisão.**
- Trocando salão por clínica, isto ainda funciona?
- Esta regra está em um lugar só?
- Esta lista deveria vir dos dados em vez de estar fixa no código?

---

## Uso em revisão

Antes de aprovar qualquer tela nova:

- [ ] Existe uma única ação primária óbvia? (4)
- [ ] Se estivesse tudo normal, a tela estaria calma? (2)
- [ ] Todo estado tem cor **e** texto? (7)
- [ ] Todo número é rastreável a um dado real? (8)
- [ ] Voltar restaura busca, filtro, ordenação e rolagem? (9)
- [ ] Os três estados de vazio estão tratados? (10)
- [ ] Erros falam português e oferecem saída? (11)
- [ ] Funciona em 320/390/430px, com alvos de 44px? (12)
- [ ] Nenhum componente ou valor visual novo foi inventado? (13)
- [ ] Sobrevive à troca de ramo de negócio? (14)

---

**Próximo documento:** [03 — Design System](03_DESIGN_SYSTEM.md).
