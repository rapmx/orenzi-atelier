# 01 — Product Language

**Versão 1.0 · 03/08/2026 · Documento estratégico. Não trata de implementação.**

Este documento define quem o Orenzi é. Se uma decisão de produto, design ou
texto contradiz este arquivo, a decisão está errada — não o arquivo.

---

## 1. Manifesto

Quem atende pessoas não tem tempo de operar software.

A cabeleireira tem tinta agindo no cabelo de uma cliente, outra chegando em
dez minutos, o telefone tocando, e um vidro de oxidante que ela acha que está
acabando. Nesse momento ela não quer um relatório. Ela quer saber uma coisa,
saber agora, e voltar ao trabalho.

O Orenzi existe para esse momento.

Não somos um sistema de gestão que a pessoa aprende a usar. Somos uma
ferramenta que responde antes de ser interrogada. O número que importa está na
primeira tela. O que precisa de atenção se apresenta sozinho. O que não precisa
fica quieto.

Recusamos a ideia de que seriedade se prova com densidade. Uma tela cheia de
caixas, abas e gráficos não é sofisticada — é preguiçosa. Alguém decidiu que
mostrar tudo era mais fácil do que decidir o que importa. Essa decisão foi
empurrada para quem estava com as mãos ocupadas.

Também recusamos o oposto: a interface bonita que esconde o trabalho. Nada aqui
existe para impressionar. Toda animação confirma uma intenção. Todo espaço em
branco separa duas coisas que não deviam se misturar. Toda cor significa algo.

O Orenzi é calmo porque quem usa não está. É preciso porque decisões de negócio
são tomadas em cima do que ele mostra. É quente porque foi feito para um lugar
onde pessoas cuidam de pessoas, e um software cinza ali seria um corpo estranho.

Um bom dia usando o Orenzi é um dia em que ninguém pensou nele.

---

## 2. Por que o Orenzi existe

Negócios de atendimento — salões, clínicas, estúdios, consultórios — operam com
uma característica que o software genérico ignora: **o trabalho e a gestão
acontecem ao mesmo tempo, pela mesma pessoa, com as mãos ocupadas.**

O que existe hoje no mercado se divide em dois extremos:

| Extremo | Problema |
|---|---|
| ERP / sistema de gestão | Feito para quem senta na frente de um computador com tempo. Denso, modal, cheio de campo obrigatório que ninguém preenche. |
| Agenda simples / caderninho digital | Resolve marcar horário e nada mais. Não sabe quem é a cliente, o que ela gastou, o que está acabando no estoque. |

O Orenzi ocupa o espaço entre os dois: **a profundidade de um sistema de
gestão, entregue na densidade de um bom aplicativo de celular.**

Existe porque a pessoa que atende merece uma ferramenta pensada para o corpo
dela — de pé, com uma mão livre, entre dois atendimentos — e não para a cadeira
de um escritório que ela não tem.

---

## 3. Missão

**Dar a quem atende o controle do próprio negócio sem tirar as mãos do
trabalho.**

Isso se traduz em três compromissos operacionais:

1. **A informação vem até a pessoa.** Ela não navega até o dado — o dado que
   importa está onde ela já ia olhar.
2. **Nada exige aprendizado.** Se um recurso precisa de tutorial, o recurso está
   mal desenhado.
3. **O sistema nunca mente.** Um número na tela é um número real. Quando não há
   dado suficiente, dizemos isso — não inventamos uma estimativa bonita.

---

## 4. Visão

O Orenzi nasceu na rotina de um salão, mas o problema que ele resolve não é de
beleza — é de **negócio baseado em atendimento agendado**.

Onde existe agenda, cliente com histórico, serviço com duração, insumo que
acaba e um número que precisa ser acompanhado, o Orenzi cabe: clínicas de
estética, fisioterapia, odontologia, tatuagem, pet shop, estúdios, terapias.

A visão é ser **o sistema operacional calmo desses negócios** — o lugar onde a
pessoa começa e termina o dia de trabalho.

O que isso exige de nós desde já:

- Vocabulário do domínio deve ser configurável, não hard-coded na identidade.
  "Cliente", "atendimento", "profissional" e "produto" são conceitos, não
  palavras fixas de salão.
- Nenhum padrão de tela pode depender de uma regra que só existe em salão.
- Crescer em profundidade (o que já existe fica melhor) antes de crescer em
  largura (mais módulos).

**Pendência declarada:** a camada de vocabulário configurável ainda não existe
no produto. Hoje os termos são de salão. Isso é dívida conhecida, não decisão.

---

## 5. Personalidade do produto

Se o Orenzi fosse uma pessoa, seria **alguém experiente que fala pouco.**

Não é o assistente animado que celebra cada clique. Não é o consultor que
explica o que você já sabe. É a pessoa que trabalha com você há anos, que
percebe que o estoque está acabando antes de você perguntar, que diz o
necessário e sai da frente.

Como isso se manifesta:

| Traço | Manifestação concreta |
|---|---|
| **Discrição** | Não avisa o que está normal. Só o que precisa de atenção aparece destacado. |
| **Precisão** | Diz "há 3 dias", não "recentemente". Diz "97% de ocupação", não "agenda cheia" — mas diz as duas, porque o número sozinho não decide nada. |
| **Honestidade** | Sem histórico suficiente, mostra "sem histórico ainda", não uma previsão inventada. |
| **Confiança sem arrogância** | Não pede confirmação para tudo. Pede quando é destrutivo, e aí pede com clareza. |
| **Calor** | A saudação é pessoal. As cores são de um ambiente, não de um painel. |
| **Contenção** | Quando em dúvida entre mostrar e não mostrar, não mostra. |

### Exemplos concretos de personalidade virando decisão de produto

Estes casos já aconteceram no Orenzi e definem o padrão:

- **A previsão de estoque tem piso de tempo.** Duas saídas na mesma tarde
  poderiam virar "você consome isso por dia" e a tela diria que o estoque acaba
  amanhã. A regra passou a exigir uma janela mínima. *Precisão acima de parecer
  inteligente.*
- **"Escanear código de barras" e "Importar contatos" foram recusados.** Estavam
  no pedido, mas não existem no produto. Um botão que não faz nada é pior que
  botão nenhum. *Honestidade acima de completude aparente.*
- **A tag VIP deixou de ser automática.** Antes, cinco visitas viravam VIP
  sozinho. Virou uma marcação manual, porque quem decide quem é VIP é a dona do
  salão, não uma regra. *O sistema informa; a pessoa decide.*
- **Nenhum menu de ações foi criado no perfil da cliente.** O padrão pedia um
  "⋯" no canto. Não havia nenhuma ação que já não tivesse lugar próprio na tela.
  *Contenção acima de convenção.*
- **Não existe amarelo no produto.** O degrau de atenção é o caramelo da marca.
  Adicionar amarelo resolveria "semáforo", mas quebraria a identidade por uma
  convenção genérica. *Identidade acima de padrão importado.*

---

## 6. Atributos

Os nove atributos do Orenzi, em ordem de precedência quando entram em conflito:

1. **Claro** — entendido na primeira leitura, sem interpretação.
2. **Preciso** — números reais, rótulos exatos, nenhuma aproximação disfarçada.
3. **Calmo** — nada compete por atenção. O silêncio é o estado padrão.
4. **Organizado** — cada coisa tem um lugar, e o lugar não muda.
5. **Confiável** — se apareceu na tela, é verdade e foi gravado.
6. **Cuidadoso** — protege de erro caro sem infantilizar.
7. **Sofisticado** — refinamento percebido, nunca anunciado.
8. **Humano** — feito para uma pessoa em um dia de trabalho real.
9. **Inteligente** — antecipa o que será perguntado, sem se gabar disso.

**Regra de desempate:** clareza vence sofisticação. Se a versão bonita é menos
clara, a versão bonita está errada.

---

## 7. Antiattributes

O que o Orenzi conscientemente não é. Cada linha é um veto, não uma preferência.

| Não somos | O que isso proíbe na prática |
|---|---|
| **Denso** | Cartão dentro de cartão. Tabelas de muitas colunas no celular. Mais de um assunto por bloco. |
| **Burocrático** | Campo obrigatório que não é necessário. Etapa que existe só para "confirmar". |
| **Barulhento** | Badge de contador em tudo. Cor de destaque em algo normal. Animação sem causa. |
| **Genérico** | Componente de biblioteca com aparência padrão. Ícone de outro sistema. |
| **Corporativo** | Vocabulário de ERP: "registro", "entidade", "processar", "módulo". |
| **Desktop espremido** | Layout de tabela adaptado. Menu lateral. Densidade de tela grande. |
| **Excessivamente tecnológico** | Gradientes, brilho, neon, glassmorphism, dark mode como estética. |
| **Infantil** | Ilustrações fofas, emoji como linguagem de interface, celebração de tarefa comum. |
| **Ansioso** | Vermelho em coisa que não é urgente. Contagem regressiva. Alerta que não pede ação. |
| **Presunçoso** | "Insight" que qualquer um veria. Previsão sem dado que a sustente. |

---

## 8. Emoções que queremos provocar

Em ordem de importância, com o teste que indica se conseguimos:

| Emoção | Teste |
|---|---|
| **Alívio** | "Já está tudo aqui, não preciso procurar." |
| **Domínio** | "Eu sei como meu negócio está indo." |
| **Segurança** | "Se está no Orenzi, está certo." |
| **Foco** | A pessoa abre, resolve e fecha sem se distrair. |
| **Apreço silencioso** | Ela nota que é bonito, mas não consegue apontar o que. |
| **Pertencimento** | O app parece do salão dela, não emprestado de outro setor. |

**Emoções que sinalizam falha:** confusão, cansaço visual, desconfiança do
número, medo de clicar, sensação de estar preenchendo formulário.

---

## 9. O que o Orenzi se recusa a ser

Recusas permanentes. Reabrir qualquer uma exige decisão explícita do dono do
produto e entrada no changelog ([10 — Governance](10_GOVERNANCE_AND_CHANGELOG.md)).

1. **Não seremos um ERP.** Nenhuma tela de cadastro genérico, nenhum módulo
   fiscal, nenhuma tela que existe "porque todo sistema tem".
2. **Não seremos desktop-first.** O celular é o produto. Telas grandes recebem o
   produto centralizado, não esticado.
3. **Não seremos coloridos.** A paleta é quente e restrita. Cor é significado,
   não decoração.
4. **Não seremos um tema escuro.** Recusado pela cliente real. Encerrado.
5. **Não seremos genéricos.** Nenhuma biblioteca de componentes entra com a
   aparência que veio.
6. **Não seremos gamificados.** Sem pontos, medalhas, streaks ou comemoração.
7. **Não mentiremos por conveniência.** Sem dado real, o produto diz que não tem
   dado.
8. **Não seremos um canal de marketing.** Nenhum upsell, nenhum banner
   promocional dentro da ferramenta de trabalho.
9. **Não seremos lentos por causa de estética.** Nenhuma animação atrasa uma
   ação. Nenhum efeito visual custa desempenho perceptível.

---

## 10. Promessa do produto

> **Você abre o Orenzi e sabe onde seu negócio está. Em segundos, sem procurar,
> sem aprender e sem duvidar do que está vendo.**

Desdobrada em quatro compromissos verificáveis:

| Promessa | Como se verifica |
|---|---|
| **Você sabe** | A informação crítica do dia está visível sem navegação. |
| **Em segundos** | Toda ação frequente cabe em até três toques. |
| **Sem aprender** | Uma pessoa nova opera as telas principais sem instrução. |
| **Sem duvidar** | Todo número mostrado é rastreável a um dado real. |

---

## 11. Critérios para avaliar se algo "parece Orenzi"

Aplicar a qualquer tela, componente, texto ou funcionalidade nova. **Um "não"
em qualquer item é motivo suficiente para revisar.**

### Teste dos 5 segundos
Abrindo a tela, em cinco segundos a pessoa sabe: onde está, o que é mais
importante ali, e qual é a próxima ação.

### Teste do silêncio
Se está tudo normal, a tela está calma. Nada pisca, nada é vermelho, nada
implora atenção.

### Teste da mão ocupada
A ação principal é alcançável com um polegar, em pé, sem precisar da outra mão.

### Teste da honestidade
Todo número na tela vem de um dado real. Nenhum é estimado sem que a tela diga
que é estimativa.

### Teste da subtração
Removendo o elemento menos importante da tela, alguém sente falta? Se não, ele
não deveria estar lá.

### Teste do vocabulário
Nenhuma palavra é de sistema. "Registro", "item", "entidade", "processar",
"OK", "erro 500" reprovam automaticamente.

### Teste da origem
Olhando só para o componente, é possível dizer que ele é do Orenzi? Se poderia
ser de qualquer app, ainda não terminou.

### Teste da cor
Toda cor fora dos neutros significa alguma coisa. Se é decorativa, sai.

### Teste do movimento
Toda animação responde a uma intenção da pessoa ou explica uma mudança de
estado. Se é só bonita, sai.

### Teste da mudança de negócio
Trocando "salão" por "clínica" e "cliente" por "paciente", a tela ainda faz
sentido? Se depende de uma regra exclusiva de salão, é caso especial, não
padrão.

---

## 12. Resumo executivo

O Orenzi é uma ferramenta de gestão mobile-first para negócios de atendimento
agendado, feita para ser usada **durante** o trabalho, não depois dele.

**Personalidade:** experiente e discreta. Fala pouco, acerta sempre, some
quando não é necessária.

**Identidade visual:** quente e minimalista — creme, bege, marrom e caramelo,
com vermelho reservado a alerta. Muito espaço negativo, tipografia limpa,
bordas e sombras discretas.

**Recusa permanente:** ser ERP, ser desktop, ser colorido, ser genérico, ser
barulhento, ser desonesto com dado.

**Promessa:** saber onde o negócio está, em segundos, sem aprender e sem
duvidar.

**Critério final:** se a pessoa terminou o dia sem pensar no software, o Orenzi
funcionou.

---

**Próximo documento:** [02 — Design Principles](02_DESIGN_PRINCIPLES.md), que
converte esta identidade em regras de decisão aplicáveis.
