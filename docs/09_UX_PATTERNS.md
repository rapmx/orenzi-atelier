# 09 — UX Patterns

**Versão 1.0 · 03/08/2026**

Soluções canônicas para os problemas que reaparecem. Um problema resolvido duas
vezes de formas diferentes é um defeito, não uma variação.

---

## Regras quantitativas

Valem em toda lista do produto, sem discussão caso a caso:

| Itens esperados | Exigência |
|---|---|
| **> 20** | busca |
| **> 30** | filtros |
| **> 50** | ordenação |
| **> 100** | carregamento progressivo |

Mais:
- **Preservar contexto ao voltar:** busca, filtro, ordenação e rolagem.
- **Ação frequente em até 3 toques**, quando viável.
- **Prévia de 3 itens** em lista secundária, com "Ver mais (N)".
- **Feedback de toque em ≤80ms**, sempre.

---

## 1. Navegação entre lista e detalhe

**Problema.** Sair de uma lista longa para ver um item e conseguir voltar ao
mesmo ponto.
**Solução.** Detalhe é uma tela dentro da mesma aba, não um modal. Entra pela
direita, sai para a direita.
**Comportamento.** Ao abrir, a barra de navegação inferior e o FAB somem — o
detalhe tem uma ação primária própria. Voltar restaura tudo (§2).
**Feedback.** Deslize de 280ms; avatar viaja quando existe nas duas telas
([05 §11](05_MOTION_SYSTEM.md)).
**Acessibilidade.** Botão de voltar com `aria-label`; foco vai para o título ao
abrir e retorna ao item de origem ao voltar.
**Estado vazio.** Não se aplica — só se abre um detalhe que existe.
**Erro.** Falha de carregamento mostra `ErrorState` no lugar do conteúdo, com o
cabeçalho já visível.
**Variações.** Detalhe de cliente, de atendimento, de produto.
**Antipadrões.** Detalhe em modal (perde o botão de voltar do sistema). Voltar
que zera a lista. Detalhe que mantém o FAB da lista.

---

## 2. Preservação de scroll

**Problema.** Voltar de um detalhe e reencontrar a lista no topo.
**Solução.** Guardar a posição de rolagem ao sair e restaurá-la ao voltar.
**Comportamento.** Restauração **sem animação** — a lista aparece já na posição.
Tocar na aba pelo rodapé **zera de propósito**: é entrada nova, não "voltar".
**Feedback.** Nenhum. O acerto é justamente não haver movimento.
**Acessibilidade.** O foco volta ao item de origem, não ao topo.
**Estado vazio / Erro.** Se a lista mudou e o item sumiu, restaurar a posição
mais próxima possível.
**Variações.** Por aba, independentes.
**Antipadrões.** Rolagem animada na volta (parece que a tela se moveu sozinha).
Guardar a posição em variável global compartilhada entre abas.

---

## 3. Busca

**Problema.** Encontrar um item entre muitos, sabendo parte do nome.
**Solução.** `SearchField` acima da lista, filtrando enquanto se digita.
**Comportamento.** Sem botão "buscar" e sem espera. Campos pesquisados
declarados no placeholder: clientes por nome, telefone e e-mail; produtos por
nome, marca, categoria, código e fornecedor.
**Feedback.** A lista se atualiza a cada tecla, **sem animação por item**.
Botão de limpar aparece quando há texto.
**Acessibilidade.** Rótulo associado; contagem de resultados anunciada por
`aria-live="polite"`.
**Estado vazio.** Sem resultados → mostra o termo buscado e oferece limpar
(§16). **Nunca** o convite de primeira vez.
**Erro.** Não se aplica — a busca é local.
**Variações.** Busca simples; busca com filtros na mesma faixa.
**Antipadrões.** ⚠ **Redesenhar a tela inteira a cada tecla** — o campo é
recriado, perde o foco e o cursor volta ao começo. Atualizar só o container da
lista. ⚠ Botão de limpar em `click` — o desfoque do campo dispara primeiro e o
botão já sumiu; usar `mousedown`.

---

## 4. Filtros

**Problema.** Reduzir uma lista por uma característica conhecida.
**Solução.** Faixa horizontal de `Chip`, seleção única, logo abaixo da busca.
**Comportamento.** Toque aplica imediatamente. Um chip ativo por vez.
**Categorias vêm dos dados reais**, nunca de lista fixa.
**Feedback.** Chip muda de estado em 160ms; a lista faz fade com 4px de
deslocamento.
**Acessibilidade.** `<button>` com `aria-pressed`; mudança anunciada.
**Estado vazio.** Filtro sem resultado → §16, com o nome do filtro na mensagem.
**Erro.** Não se aplica.
**Variações.** Chips (até 5 filtros exclusivos) · `FilterSheet` (mais de 5, ou
combináveis — ainda não existe).
**Antipadrões.** Lista fixa de categorias que não bate com os dados — vira filtro
que nunca encontra nada. Redesenho completo ao trocar de chip, que reinicia a
animação de entrada da lista.

**Filtros atuais de clientes:** Todos · VIP · Recentes · Mais frequentes ·
Inativos.

---

## 5. Ordenação

**Problema.** Ver a mesma lista por outro critério.
**Solução.** Botão de ordenação à direita da faixa de filtros, abrindo
`SortSheet`.
**Comportamento.** Escolher aplica e fecha imediatamente — sem "Aplicar". A
ordem escolhida persiste ao voltar do detalhe.
**Feedback.** Fade curto no bloco inteiro; nunca reposicionamento item a item.
**Acessibilidade.** `role="radiogroup"`, opção ativa marcada.
**Estado vazio / Erro.** Não se aplica.
**Variações.** Ordenação por prioridade de estado agrupa a lista com rótulos de
grupo; ordenação alfabética **não** — a lista não está agrupada e o rótulo
mentiria.
**Antipadrões.** Ordenação que não persiste. Rótulo de grupo em ordenação que não
agrupa.

**Ordens atuais de clientes:** Última visita · Nome (A–Z) · Maior gasto · Mais
frequentes · VIP primeiro.

---

## 6. Listas grandes

**Problema.** Centenas de itens em uma tela de celular.
**Solução.** Aplicar os limiares quantitativos e ordenar por relevância — o que
precisa de atenção vem primeiro.
**Comportamento.** Lista plana, sem cabeçalho fixo. Agrupamento só quando a
ordenação o justifica.
**Feedback.** Rolagem nativa. A barra de rolagem aparece durante o gesto e some
1s depois (padrão da agenda).
**Acessibilidade.** Contagem total anunciada. Cada item é um alvo único.
**Estado vazio.** §15 ou §16, conforme o caso.
**Erro.** `ErrorState` no lugar da lista.
**Variações.** Plana · agrupada por estado · agrupada por data.
**Antipadrões.** Rolagem infinita sem indicação de fim. Cabeçalho fixo que come
altura útil.

---

## 7. Paginação ou carregamento progressivo

**Problema.** Carregar tudo é lento; carregar pouco esconde informação.
**Solução.** Carregar o conjunto completo enquanto ele couber; acima de ~100
itens, carregar em blocos ao aproximar do fim.
**Comportamento.** Sem botão "carregar mais" na lista principal. Prévia de 3 +
"Ver mais (N)" em listas **secundárias** (histórico, movimentações).
**Feedback.** Skeleton dos próximos itens no fim da lista.
**Acessibilidade.** "Ver mais" com o número real no rótulo; após expandir, o
foco vai para o primeiro item novo.
**Estado vazio.** Nada mais a carregar → o botão some, sem mensagem.
**Erro.** "Não foi possível carregar mais. Tentar de novo."
**Variações.** Progressivo (principal) · prévia com expansão (secundária).
**Antipadrões.** Paginação numerada. **Recolher sem devolver a rolagem ao título
da seção** — o botão some junto com a lista e o dedo fica apontando para o fim
do documento.

---

## 8. Bottom sheets

**Problema.** Uma escolha ou um formulário curto sem perder o contexto.
**Solução.** `BottomSheet` ([04](04_COMPONENT_LIBRARY.md#bottomsheet)).
**Comportamento.** Sobe do rodapé; fecha por toque no fundo, arraste para baixo
ou `Esc`. Uma por vez, nunca aninhada.
**Feedback.** 240ms na entrada, 160ms na saída; arraste acompanha o dedo.
**Acessibilidade.** ⚠ Requer `role="dialog"`, captura e restauração de foco —
**nada disso existe hoje**. P0.
**Estado vazio.** Lista de opções vazia → a folha não abre; mostra `Toast`
explicando.
**Erro.** Erro dentro da folha aparece na folha, que não fecha.
**Variações.** Opções · formulário · confirmação.
**Antipadrões.** Folha ocupando mais de ~85% da altura (aí é tela). Fundo que
continua rolando. Folha sobre folha.

---

## 9. Criação de item

**Problema.** Criar cliente, produto ou atendimento com o mínimo de atrito.
**Solução.** FAB na aba correspondente. Com mais de uma coisa a criar, o FAB
abre uma folha de opções.
**Comportamento.** Formulário em folha ou tela, conforme o tamanho. Campos
obrigatórios primeiro. Salvar volta ao contexto de origem com o item visível.
**Feedback.** `Toast` de confirmação; o item novo aparece na lista.
**Acessibilidade.** Foco no primeiro campo ao abrir; `aria-label` do FAB
descreve a ação real.
**Estado vazio.** Lista vazia mostra o convite com a mesma ação do FAB.
**Erro.** Erro por campo, junto ao campo. O formulário **não** é limpo.
**Variações.** FAB direto · FAB com folha de opções · criação dentro de um fluxo
(cliente nova durante um agendamento).
**Antipadrões.** Opção que não existe no produto ("Importar contatos", "Escanear
código de barras") — botão que não faz nada é pior que botão nenhum. Perder o
que foi digitado ao errar um campo.

---

## 10. Edição

**Problema.** Alterar um dado existente sem abrir um formulário inteiro.
**Solução.** Edição no lugar para campo isolado; formulário só para alteração
ampla.
**Comportamento.** Alternância (VIP, favorito) grava direto. Campo de texto grava
ao sair do campo. Quantidade usa `QuantityControl`.
**Feedback.** A mudança fica visível imediatamente; `Toast` só quando não há
mudança visível na tela.
**Acessibilidade.** Estado da alternância em `aria-pressed`; valor alterado
anunciado.
**Estado vazio.** Campo sem valor mostra o rótulo e nada mais — nunca "não
informado" em campo editável.
**Erro.** Falha de gravação reverte o valor na tela **e** avisa. Nunca deixar a
tela mostrando um valor que não foi gravado.
**Variações.** Alternância · campo em linha · folha de edição · formulário.
**Antipadrões.** ⚠ **Escrita autenticada sem verificar que alterou uma linha** —
com a sessão expirada, a operação "passa" sem tocar em nada e a tela mente.
Modo de edição global com "Salvar" no topo.

---

## 11. Exclusão

**Problema.** Remover algo sem risco de acidente.
**Solução.** Ação destrutiva atrás de uma etapa explícita, sempre com
`ConfirmationDialog`.
**Comportamento.** A ação não fica no caminho principal. Excluir volta à lista
com o item já removido.
**Feedback.** `Toast` neutro ("Produto excluído"), sem celebração.
**Acessibilidade.** `role="alertdialog"`; o botão destrutivo **não** recebe foco
inicial; foco volta à lista.
**Estado vazio.** Se era o último item, a lista mostra o estado vazio de primeira
vez.
**Erro.** "Não foi possível excluir. Tente de novo." O item permanece.
**Variações.** Excluir (permanente) · remover de lista · cancelar atendimento —
**três coisas diferentes, três verbos diferentes**
([06 §9](06_CONTENT_GUIDELINES.md)).
**Antipadrões.** Deslizar para excluir sem confirmação. "Tem certeza?" sem
nomear o objeto. Exclusão a um toque dentro de um menu.

---

## 12. Confirmação

**Problema.** Distinguir o que merece uma pergunta do que é ruído.
**Solução.** Confirmar **apenas o irreversível**.
**Comportamento.** O diálogo reapresenta o objeto pelo nome e a consequência. O
botão nomeia a ação.
**Feedback.** Enquanto executa, o botão entra em `loading` e o diálogo não
fecha.
**Acessibilidade.** `Esc` cancela; foco capturado e restaurado.
**Estado vazio / Erro.** Falha mantém o diálogo aberto com a mensagem dentro.
**Variações.** Destrutiva · neutra (sair perdendo alterações).
**Antipadrões.** Confirmar ação reversível. Botão "Confirmar" sem verbo. Botão
destrutivo focado por padrão.

---

## 13. Undo

**Problema.** Erro de toque em ação de baixo risco.
**Solução.** Onde a ação é barata de reverter, oferecer "Desfazer" no `Toast`
em vez de confirmar antes.
**Comportamento.** Toast com ação, 5s. A operação só é enviada ao fim da janela,
ou é revertida por uma operação inversa.
**Feedback.** O item desaparece imediatamente; volta ao lugar se desfeito.
**Acessibilidade.** Alvo de 44px; anunciado por `aria-live="polite"`.
**Estado vazio / Erro.** Falha ao desfazer avisa e mantém o estado atual.
**Variações.** Adiar envio · operação inversa.
**Antipadrões.** Desfazer para ação irreversível. Desfazer **e** confirmação na
mesma ação.

⚠ **Não existe hoje.** Padrão futuro — candidato natural: alteração de
quantidade de estoque.

---

## 14. Loading

**Problema.** Espera sem saber se algo está acontecendo.
**Solução.** `Skeleton` com a geometria real. Nunca spinner de tela cheia.
**Comportamento.** Aparece só se a espera passar de ~200ms — abaixo disso, o
skeleton pisca e piora. Recarga com dado já em tela é silenciosa.
**Feedback.** Pulsação sutil; estática com movimento reduzido.
**Acessibilidade.** `aria-busy="true"` no container.
**Estado vazio.** Carregamento terminando sem dado → estado vazio, não skeleton
eterno.
**Erro.** Falha → `ErrorState` no lugar do skeleton.
**Variações.** Lista · detalhe · métricas · botão em `loading`.
**Antipadrões.** Spinner cobrindo a tela. Skeleton com geometria diferente do
conteúdo — a tela "pula" quando carrega.

---

## 15. Empty state

**Problema.** Tela vazia parece defeito.
**Solução.** Três tipos, três tratamentos
([02 §10](02_DESIGN_PRINCIPLES.md)).
**Comportamento.** Primeira vez: ícone + explicação + uma ação. Vazio normal:
só uma frase.
**Feedback.** Sem animação de entrada.
**Acessibilidade.** Texto real, não imagem. A ação tem 44px.
**Erro.** Vazio e erro são estados **diferentes** — não usar o mesmo texto.
**Variações.** Convite · neutro.
**Antipadrões.** Ilustração grande. Convite para criar onde criar não faz
sentido. Mesmo texto para "nunca teve" e "filtro não encontrou".

---

## 16. No results

**Problema.** A busca ou o filtro não encontrou nada, e a pessoa não sabe se
errou.
**Solução.** Mostrar **o que foi buscado** e oferecer limpar.
**Comportamento.** A busca e os filtros permanecem visíveis e preenchidos —
nunca são limpos automaticamente.
**Feedback.** Substituição imediata da lista, sem animação.
**Acessibilidade.** Anunciado por `aria-live="polite"`.
**Estado vazio.** É este o estado.
**Erro.** Não se aplica.
**Variações.** Busca sem resultado · filtro sem resultado · busca + filtro (a
mensagem menciona os dois e permite limpar cada um).
**Antipadrões.** "Nenhum resultado" sem mostrar o termo. Limpar a busca
sozinho. Mostrar o convite de primeira vez.

---

## 17. Offline

**Problema.** Perder conexão no meio do trabalho.
**Solução.** `Banner` persistente enquanto durar.
**Comportamento.** Leitura continua com o que está em memória. Ações de escrita
ficam desabilitadas **com motivo visível**.
**Feedback.** Banner some sozinho quando a conexão volta.
**Acessibilidade.** `role="status"`; controles desabilitados com
`aria-disabled` e explicação.
**Estado vazio.** Sem dado em memória → estado vazio explicando que é falta de
conexão.
**Erro.** Tentativa de gravar offline avisa antes de tentar.
**Variações.** Offline sem fila (hoje) · offline com fila (futuro).
**Antipadrões.** ⚠ **Prometer sincronização que não existe.** Hoje não há fila
offline — o texto não pode dizer "salvaremos depois"
([06 §21](06_CONTENT_GUIDELINES.md)).

⚠ **Não existe tratamento de offline hoje.** P1.

---

## 18. Erro recuperável

**Problema.** Falha temporária de rede ou servidor.
**Solução.** Explicar e oferecer "Tentar de novo".
**Comportamento.** O erro aparece no escopo do que falhou — bloco, não tela
inteira. O que já carregou permanece.
**Feedback.** Botão entra em `loading` ao repetir.
**Acessibilidade.** `role="alert"`; foco no botão de repetição.
**Estado vazio.** Não confundir: sem dado ≠ falha ao buscar dado.
**Erro.** Repetição falhando duas vezes → mensagem sugerindo tentar mais tarde.
**Variações.** Falha de leitura · falha de gravação (mantém o formulário).
**Antipadrões.** Código de erro na tela. Repetição automática infinita. Perder o
que foi digitado.

---

## 19. Erro crítico

**Problema.** Falha que impede continuar — sessão expirada, dado corrompido.
**Solução.** Mensagem clara com o único caminho possível.
**Comportamento.** Sessão expirada → tela de entrada, com o contexto preservado
quando possível.
**Feedback.** Sem repetição, porque não adianta.
**Acessibilidade.** `role="alert"`; foco na ação.
**Estado vazio / Variações.** Sessão expirada · falha de configuração.
**Antipadrões.** ⚠ **O pior caso do produto: falha silenciosa.** Com a sessão
expirada, a gravação "passa" sem alterar nenhuma linha e a tela mostraria
sucesso. Toda escrita autenticada precisa confirmar que alterou algo.

---

## 20. Formulários longos

**Problema.** Muitos campos em tela pequena cansam e provocam abandono.
**Solução.** Dividir em seções por assunto, com espaço entre elas. Fluxo em
passos só quando as etapas são realmente sequenciais.
**Comportamento.** Campos obrigatórios primeiro. Campo dependente permanece
desabilitado **com a explicação do que falta**. Uma ação primária ao fim.
**Feedback.** Validação ao sair do campo, não a cada tecla. Botão de envio
desabilitado enquanto faltar obrigatório, com o motivo visível.
**Acessibilidade.** Rótulos associados; erro por `aria-describedby`; foco no
primeiro erro ao enviar.
**Estado vazio.** Não se aplica.
**Erro.** Erro por campo. Nunca limpar o formulário.
**Variações.** Formulário único · passos (agendamento da cliente).
**Antipadrões.** Campo obrigatório desnecessário. Passo que só confirma o passo
anterior. **Passo que some quando não é preciso deve renumerar a contagem
exibida** — a página de agendamento faz isso: com uma profissional ativa, a
cliente vê 3 passos, não 4.

---

## 21. Upload de fotos

**Problema.** Adicionar fotos do celular, no meio do atendimento.
**Solução.** Zero fotos → estado vazio convidativo. Uma ou mais → galeria
horizontal com o botão de adicionar no fim.
**Comportamento.** Toque abre câmera ou galeria. A miniatura aparece antes do
envio terminar.
**Feedback.** Miniatura com skeleton até concluir; falha marca a foto com
opção de repetir.
**Acessibilidade.** `alt` descritivo; botão de excluir com `aria-label`
incluindo a referência da foto, e alvo de 44px (**hoje tem 26px** — P0).
**Estado vazio.** Ícone de câmera + "Adicionar fotos" + "Arraste ou toque para
adicionar".
**Erro.** Falha por foto, sem derrubar as outras.
**Variações.** ⚠ **Existem dois padrões hoje:** galeria com rolagem no perfil da
cliente e grade no detalhe do atendimento. **Convergir — decisão pendente.**
**Antipadrões.** Bloquear a tela durante o envio. Excluir sem confirmação.

---

## 22. Calendário

**Problema.** Escolher um dia entre semanas e meses.
**Solução.** Faixa de 7 dias na agenda; grade mensal no agendamento da cliente.
**Comportamento.** Navegação por semana ou mês, com deslize direcional. Dia
fechado ou passado fica desabilitado com motivo.
**Feedback.** Seleção desliza entre os dias porque os botões **não são
recriados** — só a classe muda.
**Acessibilidade.** Navegação por setas; `aria-current="date"`; dia
indisponível anuncia o porquê.
**Estado vazio.** Mês sem disponibilidade → mensagem explicando, não grade
vazia.
**Erro.** Falha ao carregar disponibilidade → `ErrorState` com repetição.
**Variações.** Faixa de semana · grade de mês.
**Antipadrões.** ⚠ **Construir o horário do dia com data local do aparelho.** O
expediente é do fuso do salão; um celular em outro fuso grava a hora errada, em
silêncio. ⚠ Manipulador de dia que usa a data capturada no momento da criação —
no caminho leve ele não é reamarrado e o segundo toque vira nada.

---

## 23. Timeline

**Problema.** Ver o dia inteiro com atendimentos de durações diferentes,
inclusive sobrepostos.
**Solução.** Grade vertical por hora, blocos posicionados por horário e duração.
**Comportamento.** **Modelo de segmentos:** trabalho → pausa (faixa listrada,
profissional livre) → finalização. Encaixe entra por cima, recuado à esquerda,
empilhado por nível. Conflito existe **só** quando um bloco de trabalho encosta
em outro.
**Feedback.** Rolagem inteligente ao abrir; barra de rolagem que aparece durante
o gesto e some 1s depois.
**Acessibilidade.** Cada bloco é um alvo com rótulo de horário, cliente e
serviço. Ordem de foco cronológica.
**Estado vazio.** "Nenhum atendimento neste dia" — frase neutra, sem convite.
**Erro.** `ErrorState` no lugar da grade, com a faixa de dias preservada.
**Variações.** Simples · com pausa · com encaixe.
**Antipadrões.** Dividir sobreposições em colunas — espreme os dois e esconde a
pausa. Tratar pausa sobreposta como conflito. Medir ocupação contra a janela
desenhada em vez do expediente real.

**Duas faixas de hora que não podem ser confundidas:** a do desenho da grade
(5h–22h, com folga nas pontas) e a do expediente real (9h–18h), usada em toda
conta de ocupação e capacidade.

---

## 24. Indicador de horário atual

**Problema.** Localizar "agora" na grade sem procurar.
**Solução.** Linha horizontal em cor de marca com selo de hora.
**Comportamento.** Só existe se o dia visível for hoje e a hora estiver dentro
da janela desenhada. Reposiciona a cada 30s **sem redesenhar a agenda**.
**Feedback.** Transição contínua; pulso único ao tocar "Hoje".
**Acessibilidade.** Decorativo — a hora já está na grade.
**Estado vazio / Erro.** Fora da janela → não existe. Sem estado de erro.
**Variações.** Normal · destacado.
**Antipadrões.** ⚠ Vermelho (é a cor de alerta; aqui é cor de marca).
⚠ Posicionar pela borda superior da caixa: o centro visual fica ~9,6px abaixo do
instante real, porque a caixa cresce para baixo a partir do ponto. Centralizar a
caixa no ponto.

---

## 25. Clientes

**Problema.** Encontrar uma cliente e entender a relação dela com o salão em
segundos.
**Solução.** Lista com busca, filtros, ordenação e cartões com métricas; perfil
com hierarquia por espaçamento.
**Comportamento.** Tudo é **derivado** de atendimentos e data de cadastro —
nenhuma coluna inventada. Estado: Nova (≤30 dias de cadastro), Inativa (>60 dias
sem visita), senão Ativa. **VIP é marcação manual**, não regra automática.
**Feedback.** Avatar viaja da lista para o perfil; rolagem preservada.
**Acessibilidade.** Estado com ponto **e** rótulo em texto.
**Estado vazio.** Sem clientes → convite para cadastrar. Filtro sem resultado →
§16.
**Erro.** `ErrorState` no lugar da lista.
**Variações.** Lista · perfil · histórico (prévia de 3 + "Ver mais").
**Antipadrões.** Derivar VIP de contagem de visitas. Métricas que não ajudam a
identificar a pessoa. Menu de ações vazio no canto do perfil.

---

## 26. Estoque

**Problema.** Saber o que está acabando antes de acabar.
**Solução.** Painel: resumo em 4 métricas → valor total → busca → chips → lista
agrupada → estatísticas → sugestões → movimentações.
**Comportamento.** Ordem intencional: **número frio primeiro, o que fazer com
ele depois, o registro do que já foi feito por último.** Críticos primeiro.
**Toda mudança de quantidade grava uma movimentação** — buraco no histórico é
previsão saindo de um saldo sem origem.
**Feedback.** Segurar `−`/`+` acumula na tela e grava **uma vez só** ao soltar.
Toque simples no número abre a edição manual.
**Acessibilidade.** Estado por badge com texto; valor anunciado ao mudar.
**Estado vazio.** Sem produtos → convite. Sem histórico → **a tela diz que não
tem histórico**, em vez de mostrar número.
**Erro.** Falha de gravação reverte o número na tela e avisa.
**Variações.** Quatro estados: `sem`, `crítico`, `baixo`, `ok`.
**Antipadrões.** Somar entrada, saída e ajuste ao calcular consumo — **só saída
é consumo**. Previsão sem janela mínima de tempo. Redesenhar a lista durante o
gesto no botão, destruindo o alvo sob o dedo.

---

## 27. Insights

**Problema.** Entender a tendência do negócio sem virar analista.
**Solução.** Um gráfico por pergunta, em `InsightCard`.
**Comportamento.** Troca de período **transforma** o gráfico, não recarrega.
Balão de ajuda explica a métrica quando ela não é óbvia.
**Feedback.** Transições preservam a continuidade entre as duas visões.
**Acessibilidade.** Resumo textual do que o gráfico mostra; séries
distinguíveis sem depender só de cor.
**Estado vazio.** Sem dado suficiente → texto explícito, **nunca gráfico vazio**.
**Erro.** `ErrorState` por card, não por tela.
**Variações.** Por tipo de gráfico.
**Antipadrões.** Dois assuntos no mesmo card. Métrica sem denominador claro.
Gráfico bonito sobre amostra pequena demais.

---

## 28. Questionário

**Problema.** Coletar informações da cliente sem parecer formulário de cartório.
**Solução.** Uma pergunta por vez ou blocos curtos, com progresso visível.
**Comportamento.** Respostas gravadas conforme avançam — nunca só no fim.
Permite sair e voltar.
**Feedback.** Progresso visível e honesto.
**Acessibilidade.** Cada pergunta é um grupo rotulado; navegação por teclado
entre opções.
**Estado vazio.** Não respondido → convite para começar.
**Erro.** Falha ao gravar uma resposta avisa sem perder as demais.
**Variações.** ⚠ **Multilíngue pendente** (pt-BR / en / es): traduzir o
questionário inteiro ou só a tela de abertura. **Decisão do dono do produto.**
**Antipadrões.** Perder respostas ao sair. Pergunta obrigatória sem necessidade.

---

## 29. Booking público

**Problema.** Uma pessoa que nunca viu o produto precisa marcar um horário sem
errar.
**Solução.** Fluxo em passos: serviço → data e hora → dados.
**Comportamento.** A escolha de profissional **some do fluxo quando há apenas
uma ativa**, e a contagem exibida ajusta ("Passo X de 3", não de 4). Reaparece
sozinha se uma segunda profissional voltar a ficar ativa.
**Feedback.** Deslize entre passos; horários indisponíveis desabilitados.
**Acessibilidade.** ⚠ **A página mais frágil hoje:** 1 `aria-label`, nenhum
tratamento de movimento reduzido, `outline: none` sem substituto. P0.
**Estado vazio.** Dia sem horário livre → mensagem explicando, com sugestão de
outro dia.
**Erro.** Falha ao confirmar mantém os dados preenchidos.
**Variações.** Com e sem escolha de profissional.
**Antipadrões.** ⚠ **Ler os horários ocupados diretamente da tabela com a chave
anônima** — a política de acesso devolve lista vazia **sem erro** e todo horário
aparece livre. Usar as funções específicas que devolvem só os blocos de
trabalho. ⚠ Duplicar o expediente entre esta página e o painel sem manter as
duas em sincronia — é a maior dívida conhecida do projeto e aparece como
overbooking.

---

## Checklist de padrão novo

Antes de criar um padrão que não está aqui:

- [ ] Algum dos 29 acima resolve, com variação?
- [ ] O problema vai reaparecer, ou é caso único?
- [ ] Existe estado vazio, sem resultado, carregando e erro definidos?
- [ ] O contexto é preservado ao voltar?
- [ ] Funciona em 320px, com alvos de 44px?
- [ ] Sobrevive à troca de ramo de negócio
      ([02 §14](02_DESIGN_PRINCIPLES.md))?

Se sim para o primeiro, use o existente. Se não, proponha pela via de
[10 §6](10_GOVERNANCE_AND_CHANGELOG.md).

---

**Próximo documento:** [10 — Governance e Changelog](10_GOVERNANCE_AND_CHANGELOG.md).
