# 05 — Motion System

**Versão 1.0 · 03/08/2026**

Como o Orenzi se move. O movimento aqui não é enfeite: é a camada que explica o
que aconteceu, em quanto tempo a pessoa percebe.

---

## 1. Filosofia de movimento

O Orenzi se move como uma **página de papel que alguém vira** — rápido, curto,
sem inércia exagerada e sem volta elástica dramática.

Toda animação do produto responde a uma destas quatro perguntas. Se não responde
a nenhuma, ela sai.

| Pergunta | Papel do movimento |
|---|---|
| "Meu toque funcionou?" | confirmar intenção |
| "De onde isso veio?" | preservar continuidade |
| "O que mudou aqui?" | explicar a mudança |
| "Onde eu estava?" | manter orientação |

O que o movimento **nunca** faz: atrasar trabalho, chamar atenção para si,
existir por ser bonito, ou compensar uma hierarquia mal resolvida.

---

## 2. Princípios

1. **Feedback antes de resultado.** O toque responde em 80ms, mesmo que a
   operação demore 800ms.
2. **Curto por padrão.** Se está em dúvida entre duas durações, use a menor.
3. **Direção carrega significado.** Avançar entra pela direita; voltar sai para
   a direita. Folha inferior sobe; some para baixo.
4. **O que não mudou não se mexe.** Só anima o painel cujo conteúdo realmente
   mudou.
5. **Uma animação por vez.** Duas coisas se movendo simultaneamente competem.
6. **Toda animação tem saída garantida.** Nenhuma pode depender só do evento de
   término para se limpar — ver §21.
7. **Movimento reduzido é um estado completo**, não uma degradação.

---

## 3. Tokens de duração

| Token | Valor | Uso |
|---|---|---|
| `--motion-instant` | **80ms** | resposta de pressão, mudança de opacidade |
| `--motion-fast` | **160ms** | botão, chip, ícone, seleção |
| `--motion-standard` | **200ms** | a maioria das transições de estado |
| `--motion-emphasized` | **240ms** | folha inferior, busca, modal |
| `--motion-route` | **280ms** | troca de tela ou de painel inteiro |

**Teto absoluto: 350ms.** Nenhuma transição rotineira passa disso.

**Exceções permitidas** (não são transições de interface):
- pulsação de skeleton: ~1200ms, em laço;
- permanência de toast: 3000ms (5000ms com "desfazer") — é tempo de leitura, não
  de animação.

### Migração das 29 durações atuais

O código tem hoje ~29 durações distintas. Mapeamento oficial:

| Valores atuais | Destino |
|---|---|
| `40ms`, `80ms`, `.12s`, `100ms`, `120ms` | `--motion-instant` (80ms) |
| `.14s`, `.15s`, `.16s`, `.18s` (29 usos), `160ms`, `180ms` | `--motion-fast` (160ms) |
| `.2s` (18 usos), `.22s`, `200ms`, `220ms` | `--motion-standard` (200ms) |
| `.25s`, `240ms` | `--motion-emphasized` (240ms) |
| `.28s`, `.3s`, `.32s`, `.35s`, `280ms` | `--motion-route` (280ms) |
| `.5s`, `.6s`, `.7s`, `1s` | **fora da escala** — avaliar caso a caso |

⚠ **`.7s` e `1s` estouram o teto de 350ms** e precisam ser inspecionados
individualmente. Se forem transições de interface, entram na escala. Se forem
laços decorativos, saem.

**Regra de migração:** as durações mudam junto com o componente, não em um passe
global. `.18s → 160ms` é uma diferença de 20ms — imperceptível isolada, mas um
passe global em ~40 lugares seria uma mudança sem revisão.

---

## 4. Easing

| Token | Curva | Uso |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.4, 0, .2, 1)` | padrão de tudo |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` | entrada de elemento |
| `--ease-in` | `cubic-bezier(.4, 0, 1, 1)` | saída de elemento |
| `--ease-spring` | `cubic-bezier(.34, 1.56, .64, 1)` | retorno elástico discreto |

`--ease-spring` já existe no código e é usado no retorno do FAB e na abertura de
modais. **A sobreposição é pequena de propósito** — retorno elástico visível é
o oposto de calma.

**Proibido:** curvas com sobreposição maior que a de `--ease-spring`, `linear`
em transição de interface (só em rotação contínua), `ease-in` na entrada de algo
que a pessoa está esperando.

---

## 5. Press feedback

O movimento mais importante do produto: acontece em todo toque.

```
transform: scale(0.98) · --motion-instant · --ease-standard
retorno:   scale(1)     · --motion-fast   · --ease-spring
```

| Elemento | Escala |
|---|---|
| Botão, card, linha de lista | 0,98 |
| Chip, pílula, alvo pequeno | 0,96 |
| Botão de ícone, `−`/`+` | 0,90 |

**Regras.** Todo alvo tocável tem resposta de pressão. Começa em ≤80ms — atraso
maior é percebido como travamento. Nunca muda o layout: só transformação e cor.

---

## 6. Hover no navegador

O produto é de toque; hover é cortesia para quem usa mouse.

- Só muda cor de fundo ou borda, em `--motion-fast`.
- Elevação em hover apenas em cards de conteúdo (`--elevation-hover`).
- **Nenhum comportamento essencial depende de hover** — no celular ele não
  existe.
- Não aplicar hover em aparelho sem ponteiro fino.

---

## 7. Focus

O anel de foco **aparece imediatamente**, sem transição.

```
box-shadow: var(--focus-ring)   /* sem transition */
```

Foco não é feedback estético — é orientação de navegação. Animá-lo atrasa a
informação de onde a pessoa está. A cor pode fazer transição em
`--motion-instant`; o anel, não.

⚠ Não existe `:focus-visible` no projeto hoje. **P0** em
[07](07_ACCESSIBILITY.md).

---

## 8. Entrada de tela

| Situação | Movimento |
|---|---|
| Primeiro carregamento | sem animação — o conteúdo aparece |
| Conteúdo após skeleton | fade de 160ms, sem deslocamento |
| Lista após filtro | fade + 4px de deslocamento vertical, `--motion-fast` |
| Detalhe vindo de lista | desliza da direita, `--motion-route` |

**Nunca:** entrada coreografada em sequência (blocos aparecendo um a um). Foi
avaliado e recusado — o produto não tem esse padrão em nenhuma tela e ele custa
tempo antes do primeiro dado legível.

---

## 9. Saída de tela

Sempre o inverso da entrada, com a **mesma duração**. Sair mais rápido do que
entrou parece falha; mais devagar parece travamento.

Elemento que a pessoa dispensou (folha, modal) sai em `--motion-fast`, não em
`--motion-emphasized`: ela já decidiu, não precisa de explicação.

---

## 10. Navegação

| Transição | Movimento | Duração |
|---|---|---|
| Lista → detalhe | desliza da direita | `--motion-route` |
| Detalhe → lista | desliza para a direita | `--motion-route` |
| Troca de aba (rodapé) | **sem deslize** — troca direta | — |
| Semana anterior/seguinte | painel inteiro desliza | 220ms |
| Dia dentro da mesma semana | só a grade desliza | 220ms |

**Por que abas não deslizam:** são destinos paralelos, não uma hierarquia. Um
deslize sugeriria uma ordem que não existe.

---

## 11. Shared transitions

Quando o mesmo elemento existe na origem e no destino, ele **viaja** em vez de
desaparecer e reaparecer.

Uso atual: o avatar da lista de clientes até o avatar do perfil.

**Como funciona.** Um clone é posicionado sobre o elemento de origem e animado
até a posição do elemento de destino; o original fica invisível durante o
trajeto.

⚠ **A limpeza precisa ser idempotente e ter três gatilhos**: término,
cancelamento e um tempo limite de segurança. Isto não é excesso de zelo — foi
falha real: sem composição de quadros (aba em segundo plano) a animação não
corre, o evento de término nunca dispara, e o resultado são clones empilhados na
tela com o elemento verdadeiro preso em opacidade zero.

**Regra geral: toda animação orquestrada em JS neste projeto precisa de um
caminho de limpeza que não dependa do evento de término.**

---

## 12. Listas e filtros

| Ação | Movimento |
|---|---|
| Trocar de filtro | fade + 4px de deslocamento, `--motion-fast` |
| Digitar na busca | **sem animação** — o resultado acompanha a digitação |
| Ordenar | fade curto no bloco inteiro, sem reposicionar item a item |
| Item removido | encolhe a altura em `--motion-standard`, depois some |

**Nunca** animar item por item em lista longa: cria uma cascata que atrasa a
leitura e custa desempenho.

⚠ **Armadilha:** animação de entrada da lista dispara de novo a cada toque em
chip se a tela inteira for redesenhada. Atualizar só o container da lista.

---

## 13. Search

- Abrir/focar: o placeholder some em `--motion-fast`; a borda muda de cor na
  mesma duração; o anel de foco aparece sem transição.
- Botão de limpar: aparece em `--motion-instant`.
- Resultados: sem animação por item. Só o container faz fade se o conjunto mudou
  inteiro.

⚠ O botão de limpar responde a `mousedown`, não a `click` — o desfoque do campo
dispara primeiro e o botão já teria sumido.

---

## 14. Bottom sheets

```
entrada: fundo escurecido 0 → 1        · --motion-emphasized · --ease-out
         folha  translateY(100%) → 0   · --motion-emphasized · --ease-out
saída:   inverso                        · --motion-fast      · --ease-in
```

O fundo escurecido e a folha se movem **juntos**, não em sequência.
Arraste para baixo acompanha o dedo em tempo real; ao soltar, completa ou volta
em `--motion-fast`.

---

## 14b. Folha de tela cheia — três movimentos, três significados

`FullScreenSheet` ([04](04_COMPONENT_LIBRARY.md#fullscreensheet)) tem **um
movimento para cada tipo de mudança**, e a regra que os separa é:

> **Vertical é entrar e sair do fluxo. Horizontal é andar dentro dele.
> Trocar um estado local não move tela nenhuma.**

```
entrar no fluxo   folha translateY(100%) → 0   · --motion-emphasized · --ease-out
sair do fluxo     folha translateY(0) → 100%   · --motion-fast       · --ease-in
                  (fundo escurecido acompanha, como no bottom sheet)

avançar           entra  translateX(100%) → 0  · 260ms · --ease-out
                  sai    translateX(0) → -28%  + opacidade .6
voltar            inverso dos dois

conteúdo local    opacity 0 → 1 + translateY(4px) → 0 · --motion-fast · --ease-out
                  altura do contêiner interpolada no mesmo tempo
```

**A saída horizontal recua só 28%, não 100%.** É o parallax do navigation
stack: a tela que sai anda menos que a que entra, e isso lê como camada por
baixo em vez de duas telas se empurrando.

**O shell não se mexe em nenhuma navegação interna.** Quem desliza é o palco
(`.o-fullsheet-stage`), que carrega cabeçalho, corpo e rodapé de uma tela. O
fundo, a altura e a largura da folha ficam parados o tempo todo — é isso que
distingue "andei para a próxima tela" de "abriu outra modal por cima".

**Erro que isto corrige (13/08/2026).** Enquanto a entrada vertical era uma
regra do container em vez de uma classe, todo re-render a reaplicava: cada
etapa do wizard e cada toque no segmented control disparavam bottom→top, e o
fluxo inteiro parecia uma pilha de modais abrindo uma sobre a outra. A
animação de entrada agora é `.is-entering`, posta **só** por quem abre o
fluxo.

**Nunca:** vertical em troca de etapa; vertical em troca de estado local
(segmented, toggle, filtro); indicador de segmented que apaga de um lado e
acende do outro em vez de deslizar.

---

## 15. Modais

```
entrada: fade + scale(.96 → 1) subindo de baixo · --motion-emphasized · --ease-spring
saída:   fade + scale(1 → .98)                   · --motion-fast      · --ease-in
```

O modal de novo agendamento usa esta receita — a mesma do balão de ajuda de
Insights, mas subindo em vez de nascer centralizado, porque é uma folha de
formulário comprida e não um balão curto.

⚠ **Desde 13/08/2026 o novo agendamento não é mais um modal**, e sim uma
`FullScreenSheet` (§14b) — a receita acima continua valendo para os modais
que restam (balão de ajuda, folha de produto do Estoque).

**Nunca:** modal que cai de cima, que gira ao entrar, ou que escala de zero.

---

## 16. FAB

| Situação | Movimento |
|---|---|
| Pressão | escala 0,92, `--motion-instant`; retorno em `--ease-spring` |
| Abrir menu | ícone gira até 45°, `--motion-fast`; opções entram em cascata de 40ms |
| Fechar | inverso, `--motion-fast`, sem cascata |
| Entrar na tela | fade + escala 0,8 → 1, `--motion-standard` |

A cascata de 40ms na abertura é a **única** cascata permitida no produto, e só
porque as opções são poucas (três) e nascem de um ponto comum.

---

## 17. Toasts

```
entrada: translateY(-60px) → 0 · --motion-standard · --ease-out
espera:  3000ms (5000ms com "desfazer")
saída:   inverso                · --motion-fast    · --ease-in
```

Um por vez. Toast novo substitui o anterior — não empilha.

---

## 18. Skeletons

Pulsação de opacidade entre 1 e 0,6, ~1200ms, em laço, `--ease-standard`.

**Sem varredura de brilho** atravessando o bloco: é o efeito mais associado a
template genérico e contradiz a calma do produto.

**Com movimento reduzido:** estático, na opacidade média. Sem pulsação.

A troca de skeleton para conteúdo é um fade de `--motion-fast`, sem
deslocamento.

---

## 19. Calendário e timeline

**Dois níveis de deslize, cada um só quando o que ele mostra muda:**

| Nível | O que desliza | Quando |
|---|---|---|
| Semana | faixa de dias + título + grade | semana anterior/seguinte, "Hoje" indo para outra semana |
| Dia | só a grade | toque em um dia da mesma semana |

No caminho leve, a faixa de dias **não é recriada** — só a classe de seleção
troca nos mesmos botões. É isso que faz a transição de fundo e borda do dia
animar de verdade: **um elemento recém-criado nunca anima o próprio
nascimento.**

**Rolagem inteligente ao trocar de dia.** A grade abre perto do horário
relevante (agora, se for hoje; o primeiro atendimento, se houver; a abertura, se
não houver), sempre com ~1h30 de contexto acima do alvo. Esse posicionamento é
**instantâneo**, com a rolagem suave desligada por um instante — animar faria a
grade parecer rolar sozinha a cada troca de dia. Rolagem animada só no botão
"Hoje", que pede um movimento visível de propósito.

**Indicador do horário atual.** Reposiciona a cada 30s **sem redesenhar a
agenda**, com transição contínua. Ao tocar "Hoje", pulsa uma vez.

**Botão "Hoje" nunca é ação nula:** se o dia visto não é hoje, desliza a semana e
pulsa o indicador; se já é hoje, recentraliza com rolagem animada e destaca o
indicador. Sem isso, o toque pareceria não ter feito nada.

---

## 20. Gráficos

| Situação | Movimento |
|---|---|
| Primeira renderização | barras/linha crescem em `--motion-emphasized` |
| Troca de período (6 → 12 meses) | eixo e séries **se transformam**, não recarregam |
| Filtro alterado | fade curto, `--motion-fast` |
| Toque em ponto | destaque em `--motion-instant` |

Na troca de período a continuidade é o ponto: as barras que existem nos dois
períodos mudam de posição e altura; as novas entram com fade. Recarregar o
gráfico inteiro perderia a relação entre as duas visões.

---

## 21. Reduced motion

`prefers-reduced-motion: reduce` **desliga movimento de posição e escala**,
preservando mudanças de opacidade curtas.

| Categoria | Com movimento reduzido |
|---|---|
| Pressão (escala) | sem transformação; só mudança de cor |
| Deslize de tela | troca direta, sem deslocamento |
| Folha inferior | fade de 100ms, sem subida |
| Transição compartilhada | não acontece; o destino aparece direto |
| Skeleton | estático |
| Spinner | pulsação de opacidade, sem rotação |
| Gráfico | valores finais direto |
| Rolagem animada | posicionamento instantâneo |
| Anel de foco | inalterado — **nunca** é reduzido |

**Duas camadas obrigatórias.**
1. **CSS:** um bloco `@media (prefers-reduced-motion: reduce)` zerando duração e
   transformação.
2. **JS:** toda animação orquestrada em código **verifica a preferência no
   início** e pula direto ao estado final. Não dá para confiar só no CSS: uma
   sequência de clone + quadros + limpeza é orquestrada em JS e o `@media` não a
   interrompe.

⚠ **Estado atual:** `painel.html` tem 4 blocos de movimento reduzido e verifica a
preferência em JS. **`agendar.html` não tem nenhum** — é a página da cliente,
com transições de passo animadas. **P0** em [07](07_ACCESSIBILITY.md).

---

## 22. Motion proibido

1. Qualquer transição rotineira acima de **350ms**.
2. Retorno elástico maior que `--ease-spring`.
3. Movimento decorativo contínuo: partícula, gradiente animado, brilho pulsante,
   ícone que se mexe sozinho.
4. Efeito de varredura em skeleton.
5. Entrada coreografada em sequência de blocos de uma tela.
6. Rotação de elemento que não seja indicador de espera ou o `+` do FAB.
7. Salto, balanço ou tremor — inclusive em erro.
8. Animação que impeça a interação enquanto corre.
9. Animação de layout (altura, largura, margem) sem necessidade — usar
   transformação, que não força recálculo.
10. Animação sem caminho de limpeza independente do evento de término.
11. Animação de elemento recém-criado esperando que ele "anime o próprio
    nascimento" — não anima; é preciso atualizar o nó existente.
12. Duração diferente para entrada e saída do mesmo elemento, exceto o caso
    documentado em §9.

---

## Receitas rápidas

| Situação | Receita |
|---|---|
| **Botão pressionado** | `scale(.98)` 80ms → retorno 160ms `--ease-spring` |
| **Card pressionado** | `scale(.98)` + `--elevation-hover`, 160ms |
| **Chip selecionado** | `scale(.96)` 80ms + cor de fundo/borda 160ms |
| **Troca de filtro** | lista: fade + 4px, 160ms; sem animar item a item |
| **Abrir folha inferior** | fundo 0→1 e folha 100%→0, juntos, 240ms `--ease-out` |
| **Abrir detalhe** | desliza da direita 280ms; avatar viaja se existir nos dois |
| **Voltar preservando contexto** | desliza para a direita 280ms; busca, filtro, ordenação e rolagem restaurados sem animação |
| **FAB** | pressão `scale(.92)` 80ms; abrir menu: ícone gira 45° 160ms + opções em cascata de 40ms |
| **Gráfico 6 → 12 meses** | eixo e séries se transformam em 240ms; barras novas entram com fade |
| **Indicador de horário atual** | reposiciona a cada 30s com transição contínua, sem redesenhar; pulso único ao tocar "Hoje" |
| **Rolagem para "Hoje"** | rolagem animada (único caso); nas outras trocas de dia, posicionamento instantâneo |

---

**Próximo documento:** [06 — Content Guidelines](06_CONTENT_GUIDELINES.md).
