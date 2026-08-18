# 06 — Content Guidelines

**Versão 1.0 · 03/08/2026**

Como o Orenzi escreve. O texto de interface é parte do produto, não legenda dele.

---

## 1. Personalidade verbal

O Orenzi escreve como **uma colega experiente falando com você entre dois
atendimentos**: direta, informada, sem cerimônia e sem intimidade forçada.

| Escrevemos | Não escrevemos |
|---|---|
| "Estoque acabando: 3 produtos" | "Atenção! Você tem itens com estoque crítico!" |
| "Sem histórico ainda" | "Nenhum dado disponível no momento" |
| "há 3 dias" | "recentemente" |
| "Excluir produto" | "Prosseguir" |

**Três regras que resolvem a maioria dos casos:**
1. Diga o que é, não o que a pessoa deveria sentir.
2. Se cabe em cinco palavras, não use dez.
3. Nomeie a coisa: "produto", "cliente", "atendimento" — nunca "item",
   "registro", "elemento".

---

## 2. Tom de voz

Constante em toda a interface. O que muda por contexto é a **temperatura**, não
a personalidade.

| Contexto | Temperatura | Exemplo |
|---|---|---|
| Rotina | neutra | "12 clientes" |
| Sucesso | discreta | "Produto salvo" |
| Atenção | objetiva | "3 produtos abaixo do mínimo" |
| Urgência | direta | "Oxidante 20vol acabou" |
| Erro | responsável | "Não foi possível salvar. Tente de novo." |
| Vazio | acolhedora | "Nenhuma foto ainda. Toque para adicionar." |

**Nunca:** exclamação em texto de interface (exceto nenhum caso previsto),
maiúsculas para dar ênfase, emoji como linguagem de produto.

---

## 3. Formalidade

**Segunda pessoa implícita, tratamento "você", sem gerúndio de gentileza.**

| Correto | Incorreto |
|---|---|
| "Adicione uma foto" | "Você poderia adicionar uma foto?" |
| "Salvar cliente" | "Estaremos salvando a cliente" |
| "Não foi possível carregar" | "Ops! Algo deu errado :(" |
| "Toque para adicionar" | "Clique aqui para adicionar" — é celular, não se clica |

Evite "por favor" em botões e rótulos. Guarde para o raro caso em que pedimos
algo fora do fluxo.

---

## 4. Clareza

Uma frase de interface tem que ser entendida na primeira leitura, por alguém
distraído.

- Uma ideia por frase.
- Ordem direta: sujeito, verbo, objeto.
- Sem subordinada dentro de rótulo ou botão.
- Sem ambiguidade de sujeito: "Ela foi salva" — quem?

| Correto | Incorreto |
|---|---|
| "A cliente será removida da lista." | "A remoção será processada." |
| "Escolha um serviço para ver os horários." | "Os horários dependem do serviço selecionado." |

---

## 5. Objetividade

Corte tudo que não muda o entendimento.

| Antes | Depois |
|---|---|
| "Você não possui nenhum produto cadastrado no momento" | "Nenhum produto cadastrado" |
| "Por favor, selecione uma data para continuar" | "Escolha uma data" |
| "A operação foi realizada com sucesso" | "Salvo" |

**Teste:** remova a primeira e a última palavra. Se a frase continua correta,
elas eram enfeite.

---

## 6. Empatia

Empatia no Orenzi é **não desperdiçar o tempo de quem lê e não culpar ninguém**.
Não é linguagem afetuosa.

| Correto | Incorreto |
|---|---|
| "Não foi possível salvar. Verifique sua conexão." | "Você está sem internet!" |
| "Este horário já está ocupado." | "Você escolheu um horário inválido." |
| "Sem histórico suficiente para prever." | "Dados insuficientes." |

Erro nunca começa com "Você".

---

## 7. Vocabulário

**Português do Brasil.** Interface do painel e da página de agendamento em
pt-BR; a landing é bilíngue PT/EN.

- Termos técnicos de sistema **nunca** aparecem: "registro", "entidade",
  "processar", "requisição", "sincronizar", "instância", "query", "token",
  "cache".
- Anglicismo só quando já é a palavra usada no dia a dia do salão: "check-in"
  não é; "e-mail" é.
- Jargão de gestão fica de fora: "KPI", "churn", "lead", "conversão", "ticket
  médio" → "gasto médio".

---

## 8. Termos oficiais do produto

**Um conceito, uma palavra.** Estes são os termos canônicos.

| Conceito | Termo oficial | Nunca |
|---|---|---|
| Pessoa atendida | **cliente** | usuária, paciente, consumidora, contato |
| Quem atende | **profissional** | funcionária, colaboradora, staff |
| Compromisso agendado | **atendimento** | agendamento (só o ato de marcar), booking, reserva, evento |
| O que se oferece | **serviço** | procedimento, tratamento (é uma categoria), item |
| Insumo | **produto** | item, material, mercadoria, SKU |
| Registro de entrada/saída | **movimentação** | transação, lançamento, log |
| Painel de números | **Insights** | dashboard, relatórios, BI |
| Ficha da cliente | **perfil** | cadastro, ficha, registro |
| Marca de cliente preferencial | **VIP** | premium, gold, especial |
| Grade de horários | **agenda** | calendário (é o seletor de mês), cronograma |

⚠ **"Agendamento" × "atendimento":** agendamento é o ato de marcar
("Novo agendamento"); atendimento é a coisa marcada ("3 atendimentos hoje").

⚠ **Pendência de escala:** estes termos são de salão. Ver
[01 §4](01_PRODUCT_LANGUAGE.md) — o vocabulário configurável ainda não existe.

---

## 9. Verbos de ação

Um verbo por ação, sempre o mesmo.

| Ação | Verbo | Nunca |
|---|---|---|
| Criar | **Cadastrar** (produto, cliente) / **Agendar** (atendimento) | Adicionar, Incluir, Novo |
| Gravar alteração | **Salvar** | Confirmar, Aplicar, Atualizar |
| Remover permanentemente | **Excluir** | Deletar, Remover, Apagar |
| Tirar de uma lista sem apagar | **Remover** | Excluir |
| Desfazer marcação | **Desmarcar** | Remover |
| Sair de um fluxo | **Cancelar** | Voltar, Fechar |
| Cancelar um atendimento | **Cancelar atendimento** | Excluir |
| Repetir tentativa | **Tentar de novo** | Recarregar, Retry |
| Ver mais itens | **Ver mais (N)** | Carregar mais, Expandir |
| Reduzir a lista | **Ver menos** | Recolher, Fechar |
| Limpar filtro/busca | **Limpar** | Resetar, Redefinir |

---

## 10. Labels

- Substantivo curto, sem dois-pontos, sem "Digite o".
- Primeira letra maiúscula, resto minúsculo. Nunca caixa alta.
- Rótulo é obrigatório e **sempre visível** — placeholder não substitui rótulo
  ([04 — Input](04_COMPONENT_LIBRARY.md#input)).

| Correto | Incorreto |
|---|---|
| Nome | NOME / Nome: / Digite o nome |
| Telefone | Telefone da cliente |
| Quantidade mínima | Qtd. mín. |
| Total investido | Gasto total |

⚠ **"Total investido", não "gasto".** Decisão de produto tomada no perfil da
cliente: investir descreve a relação; gastar descreve perda.

---

## 11. Botões

**Verbo + objeto.** O botão diz o que vai acontecer, fora de contexto.

| Correto | Incorreto |
|---|---|
| Salvar cliente | Salvar · Confirmar · OK |
| Excluir produto | Excluir · Confirmar · Sim |
| Agendar atendimento | Prosseguir · Continuar · Avançar |
| Registrar saída | Confirmar |
| Tentar de novo | Recarregar |

**Exceções aceitas:** "Cancelar" sozinho (universal e não destrutivo) e
"Ver mais (N)".

**Máximo de três palavras.** Se precisa de mais, o contexto acima do botão está
faltando.

---

## 12. Placeholders

Placeholder mostra **formato ou exemplo**, nunca repete o rótulo nem dá
instrução.

| Campo | Placeholder correto | Incorreto |
|---|---|---|
| Nome | *(vazio)* | Digite o nome |
| Telefone | +353 87 123 4567 | Telefone |
| Busca de clientes | Nome, telefone ou e-mail | Buscar... |
| Busca de produtos | Produto, marca, categoria, código | Pesquisar |
| Quantidade mínima | 0 | Informe a quantidade |

Campos óbvios não precisam de placeholder. Vazio é melhor que redundante.

---

## 13. Helper text

Aparece abaixo do campo, em texto secundário. Existe para **prevenir erro**, não
para explicar o óbvio.

Use quando: o formato importa, há uma regra não evidente, ou o campo depende de
outro.

| Correto | Incorreto |
|---|---|
| "Usado para avisar sobre o atendimento." | "Campo de e-mail" |
| "Abaixo deste valor, o produto entra em alerta." | "Digite um número" |
| "Escolha o serviço e a data para ver os horários." | "Campo obrigatório" |

Campo obrigatório se indica no rótulo, não no texto de apoio.

---

## 14. Erros

**Estrutura:** o que não aconteceu → por quê (se sabemos) → o que fazer.

| Situação | Texto |
|---|---|
| Falha de rede | "Não foi possível salvar. Verifique sua conexão e tente de novo." |
| Sessão expirada | "Sua sessão expirou. Entre novamente para continuar." |
| Campo obrigatório | "Informe o nome da cliente." |
| Formato inválido | "Telefone incompleto." |
| Conflito de horário | "Este horário já está ocupado. Escolha outro." |
| Falha desconhecida | "Não foi possível concluir. Tente de novo em instantes." |

**Proibido:** código de erro, status HTTP, nome de tabela ou campo do banco,
"erro inesperado", "algo deu errado", "Ops", exclamação, culpa ao usuário.

⚠ **Erro silencioso é o pior de todos.** Se a gravação não aconteceu, a tela não
pode mostrar sucesso — armadilha real do projeto: com a sessão expirada, a
escrita "passa" sem tocar em nenhuma linha.

---

## 15. Sucesso

Curto, no passado, sem celebração. Aparece em `Toast` e some sozinho.

| Ação | Texto |
|---|---|
| Cliente salva | "Cliente salva" |
| Produto cadastrado | "Produto cadastrado" |
| Quantidade alterada | "Estoque atualizado" |
| Atendimento criado | "Atendimento agendado" |
| Foto adicionada | "Foto adicionada" |

**Nunca:** "Sucesso!", "Tudo certo!", "Pronto! 🎉", "Salvo com sucesso".

Ação com resultado visível na tela **não precisa de confirmação em texto** —
marcar VIP muda o ícone; isso já é a confirmação.

---

## 16. Alertas

Alerta diz **o que precisa de atenção e o quanto**. Número antes de adjetivo.

| Situação | Texto |
|---|---|
| Estoque baixo | "3 produtos abaixo do mínimo" |
| Estoque zerado | "Oxidante 20vol acabou" |
| Agenda cheia | "Agenda praticamente lotada" |
| Previsão | "Acaba em ~5 dias no ritmo atual" |
| Sem dado para prever | "Sem histórico suficiente para prever" |

**Regras.** Sem exclamação. Sem "Atenção:". O grau de urgência vem da cor e do
rótulo de estado, não da pontuação. Estimativa é declarada como estimativa —
"~5 dias", "no ritmo atual".

---

## 17. Empty states

Três tipos, três textos diferentes ([02 §10](02_DESIGN_PRINCIPLES.md)).

**Primeira vez** — explica e convida:
> "Nenhuma foto ainda"
> "Arraste ou toque para adicionar"
> `[Adicionar fotos]`

**Sem resultado de busca** — mostra o termo e oferece saída:
> "Nada encontrado para "maria""
> `[Limpar busca]`

**Vazio normal** — só informa:
> "Nenhum atendimento neste dia"

| Correto | Incorreto |
|---|---|
| "Nenhum produto cadastrado" | "Sua lista está vazia :(" |
| "Nada encontrado para "oxid"" | "Nenhum resultado" |
| "Nenhum atendimento neste dia" | "Que tal aproveitar para descansar?" |

---

## 18. Confirmações

**Título nomeia a ação e o objeto. Botão repete o verbo.**

> **Excluir o produto Oxidante 20vol?**
> O histórico de movimentações é mantido.
> `[Cancelar]` `[Excluir produto]`

| Correto | Incorreto |
|---|---|
| "Cancelar o atendimento de Maria às 14:00?" | "Tem certeza?" |
| `[Excluir produto]` | `[Confirmar]` / `[Sim]` |
| "Esta ação não pode ser desfeita." | "Atenção! Ação irreversível!" |

**Só confirmar o que é irreversível.** Marcar VIP, alternar filtro ou mudar
quantidade em um passo não pedem confirmação.

---

## 19. Exclusões

- Sempre diga **o que se perde** e **o que fica**.
- Nomeie o objeto no título.
- O botão destrutivo usa o tratamento vermelho e não recebe foco inicial.
- Depois de excluir: `Toast` neutro ("Produto excluído"), sem celebração.

| Correto | Incorreto |
|---|---|
| "Excluir a cliente Maria Silva? O histórico de atendimentos é mantido." | "Deseja realmente excluir este registro?" |

---

## 20. Loading

**A regra é não escrever nada.** Skeleton comunica melhor que texto.

Texto só quando a espera é longa e a pessoa precisa saber que vale esperar:
> "Carregando atendimentos…"

**Nunca:** "Aguarde…", "Processando…", "Carregando, por favor aguarde", barra de
progresso falsa.

---

## 21. Offline

Banner persistente enquanto durar:
> "Sem conexão. Suas alterações serão salvas quando a internet voltar."

Se não houver fila de alterações — que é o caso hoje:
> "Sem conexão. Não é possível salvar agora."

⚠ **Não prometa sincronização que o produto não faz.** Hoje não existe fila
offline. **PENDENTE:** decidir se haverá.

---

## 22. Notificações

Fora da interface (e-mail), o tom é o mesmo, com uma diferença: a pessoa não
está no contexto, então o **objeto vem antes da ação**.

> Assunto: "Novo atendimento — Maria Silva, sábado 9 de agosto às 14:00"

**Regras.** Assunto se basta sem abrir. Sem "Não responda a este e-mail" no
começo. Sem marketing.

⚠ O envio hoje dispara a cada novo atendimento gravado. Cuidado com dados de
teste.

---

## 23. Datas

Formato conforme o espaço disponível. **Locale `pt-BR`, fuso do salão
(`Europe/Dublin`).**

| Contexto | Formato | Exemplo |
|---|---|---|
| Título de dia na agenda | por extenso | "Domingo, 2 de agosto de 2026" |
| Lista, metadado | numérico curto | "02/08/2026" |
| Timeline, empilhado | dia / mês / ano | "09 · Ago · 2026" |
| Relativo | quando ajuda mais que a data | "hoje", "há 1 dia", "há 3 dias" |
| Hora | 24h com dois dígitos | "14:00", "09:00" |
| Mês e ano | primeira letra maiúscula | "Agosto de 2026" |

⚠ **Nunca use maiusculização automática por palavra em texto com preposição** —
ela produz "Agosto **De** 2026". Maiusculize apenas a primeira letra, no código.

**Data e relativo juntos** quando ambos ajudam: "09 Ago" com "há 3 dias" abaixo.

**Fuso:** todo horário exibido é o do salão, não o do aparelho. Falha silenciosa
conhecida — ver `CLAUDE.md`.

---

## 24. Valores monetários

**Euro, símbolo antes do número, sem espaço.**

| Contexto | Formato | Exemplo |
|---|---|---|
| Valor de serviço, gasto | inteiro quando não há centavos | `€45` |
| Com centavos | vírgula decimal | `€45,50` |
| Total agregado | separador de milhar | `€1.250` |
| Zero | explícito | `€0` |
| Desconhecido | traço, nunca `€0` | `—` |

**Nunca:** "45 euros", "EUR 45", `45€`, valor sem símbolo em coluna de dinheiro.

⚠ **`€0` e "sem valor" são coisas diferentes.** Nunca mostre zero para dado
ausente.

### 24.1 Abreviação em escala de gráfico — exceção única (18/08/2026)

**Não se abrevia dinheiro.** A regra acima vale em todo valor que a cliente lê
como **quantia**: hero, indicadores, readout, valor por serviço, histórico,
totais, preço de serviço.

A **única** exceção aprovada é o **rótulo de tick do eixo de um gráfico
analítico**, onde o número é **régua**, não quantia:

| Contexto | Formato | Exemplo |
|---|---|---|
| Tick de eixo, abaixo de mil | inteiro, sem abreviar | `€200` |
| Tick de eixo, mil ou mais | `k`, vírgula decimal | `€1k`, `€1,5k` |

Condições para a exceção valer, todas ao mesmo tempo:

1. o número é **rótulo de escala**, e não um valor que alguém possa copiar,
   somar ou comunicar;
2. o valor exato da mesma grandeza está disponível em outro lugar da tela — no
   Financeiro, o readout do gráfico e o hero;
3. o `aria-label` do gráfico continua descrevendo os valores **por extenso**.

Origem: eixo Y da Distribuição Analytical do Financeiro (`finTick()`). Fora
desse padrão, abreviar dinheiro continua proibido — inclusive num eixo que não
cumpra as três condições acima.

---

## 25. Quantidades

- Inteiro quando é inteiro; decimal com vírgula quando não é: `1,5`.
- Sempre com a unidade quando ela não é óbvia: "500 ml", "3 un".
- Zero é explícito: "0 em estoque", nunca "—".
- Contagem com o substantivo, concordando: "1 cliente", "12 clientes".
- Estimativa marcada como tal: "~5 dias".
- **Números que atualizam usam dígitos de largura fixa**, para não "tremer".

---

## 26. Internacionalização futura

Hoje: painel e agendamento em pt-BR; landing em PT/EN. Está previsto um
questionário multilíngue (pt-BR / en / es) — **decisão pendente** sobre traduzir
o questionário inteiro ou apenas a tela de abertura.

**Regras para não bloquear o futuro:**
1. Nenhuma frase montada por concatenação de pedaços — a ordem das palavras muda
   entre idiomas.
2. Plural resolvido por regra explícita, não por "adicionar s".
3. Espaço para até **30% mais texto** em qualquer rótulo. Alemão e espanhol são
   mais longos que o português.
4. Data, hora e moeda sempre por formatação de locale, nunca por concatenação
   manual.
5. Nenhum texto dentro de imagem.
6. Nenhuma dependência de comprimento fixo de texto no layout.

---

## 27. Palavras preferidas

| Prefira | A |
|---|---|
| cliente | usuária, contato |
| atendimento | booking, evento, compromisso |
| produto | item, material |
| cadastrar | adicionar, incluir |
| salvar | confirmar, aplicar |
| excluir | deletar, apagar |
| escolher | selecionar |
| ver mais | carregar mais, expandir |
| sem histórico ainda | dados insuficientes |
| total investido | gasto |
| acabou | zerado, esgotado |
| abaixo do mínimo | crítico (na frase; "crítico" é rótulo de estado) |
| toque | clique |
| tente de novo | recarregue |

---

## 28. Palavras a evitar

**Proibidas na interface:**
registro · entidade · item (como substituto de produto/cliente) · processar ·
requisição · sincronizar · instância · query · cache · token · sessão (exceto no
texto de sessão expirada) · erro inesperado · algo deu errado · Ops · falha
crítica · sistema · aplicação · módulo · funcionalidade · usuário · dados (como
sujeito: "os dados foram salvos" → "salvo").

**Evitar por tom:**
incrível · fantástico · perfeito · uau · parabéns · agora ficou fácil ·
simplesmente · apenas (quando minimiza um esforço real) · rapidinho · só isso.

**Evitar por imprecisão:**
recentemente · em breve · alguns · vários · muitos · em geral · normalmente ·
provavelmente (sem número que sustente).

---

## Checklist de revisão de texto

- [ ] O botão nomeia a ação com verbo + objeto?
- [ ] O erro evita culpar e oferece um próximo passo?
- [ ] Existe alguma palavra da lista proibida?
- [ ] Todo número tem unidade, moeda ou substantivo?
- [ ] Data e hora estão no fuso do salão?
- [ ] O texto cabe com 30% a mais de caracteres?
- [ ] Removendo a primeira e a última palavra, a frase continua correta? (Se
      sim, corte-as.)
- [ ] Algum termo diverge da tabela de termos oficiais (§8)?

---

**Próximo documento:** [07 — Accessibility](07_ACCESSIBILITY.md).
