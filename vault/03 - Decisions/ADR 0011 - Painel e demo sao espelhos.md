# ADR 0011 — `painel_demo.html` é espelho obrigatório do `painel.html`

- **Data:** 02/08/2026
- **Status:** aceito
- **Decisor:** Raphael

## Contexto

É preciso demonstrar o painel sem credencial e sem tocar dado real de cliente.

## Decisão

`painel_demo.html` é **cópia** do `painel.html`, diferindo **apenas** no stub de
`window.supabase` no topo: leitura vem de `mockData(table)`, escrita "sucede"
sem persistir.

**Toda mudança de tela entra nos dois.**

## Alternativas consideradas

- **Flag de demo dentro do painel** — descartado: colocaria um caminho de
  mentira dentro do arquivo que roda com dado real.
- **Não ter demo** — descartado: é a superfície de apresentação do produto.

## Consequências

- É a regra mais quebrada do projeto e a mais barata de respeitar.
- O demo carrega ~602 KB contra 555 KB do painel — os cenários de exemplo
  (`demoSalao()`) são a diferença.
- Bugs nascem **no stub**, não na tela: em 15/08 o
  `.eq().order().limit().maybeSingle()` estourava `TypeError` e "Infos do
  questionário" não fazia nada, nem toast.
- Cenários de demo têm regras próprias: os dias são contados como
  "1º/3º/5º **abertos** a partir de amanhã" — nunca data de calendário cravada
  (deixaria o demo abrindo num dia vazio) e nunca diferença em milissegundos
  (na virada do horário de verão dois dias civis distam 47h ou 49h). E o
  encaixe precisa caber **inteiro** na pausa, senão o demo mostra estado que o
  guard de conflito real recusaria — demo que exibe estado inválido não serve
  para decidir nada.

## Reversibilidade

Alta, mas sem motivo. O custo é disciplina, não arquitetura.

## Links

[[Frontend Architecture]] · [[Agenda]] · [[ADR Index]]
