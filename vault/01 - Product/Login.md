# Login

**Estado: V2 IMPLEMENTADA em 15/08/2026 — "cartão de recepção" (direção B).**

## O que é

Autenticação do Supabase, no `painel.html` (e no espelho `painel_demo.html`).
Âncoras: `renderLogin()`, `submeterLogin()`, `checkSession()`,
`encerrarSessaoUI()`. É a única superfície autenticada do projeto —
`agendar.html` e `gerenciar.html` rodam com a chave anônima.

## O que a V2 decidiu

- **Cartão de `--color-surface` sobre `--color-bg`**, com os primitivos do DS
  (`.o-field` / `.o-input` / `.o-btn.o-btn-primary`) no lugar do CSS local. O
  CTA antigo era `--color-accent` (3,12:1, reprova AA); hoje é
  `--color-accent-700` (5,02:1).
- **A [[Splash]] não é trocada pelo Login: ela vira o Login** (16/08/2026). O
  wordmark é o elemento compartilhado — sobe da posição da splash até a posição
  final do Login enquanto título, campos e CTA se revelam. A primeira versão
  resolvia isso por alinhamento (a marca ficava parada); funcionava, mas a
  passagem continuava sendo um corte. O ciclo de vida da splash — `markReady`,
  piso de branding, teto, readiness — **não foi tocado em nenhuma das duas
  rodadas**: a passagem roda depois de a saída já ter sido autorizada.
- **A abertura de marca pertence ao boot.** Logout e sessão expirada desenham o
  Login pronto, sem repetir o movimento: seria uma splash falsa.
- **Formulário de verdade**: `<form>` (Enter envia), `<label for>` visível,
  `autocomplete` de usuário e senha, campos de 16px (o Safari do iPhone dá zoom
  abaixo disso), botão com estado busy por `orenziUI.setButtonBusy()` e um
  submit por vez.
- **Erro não redesenha a tela.** A V1 chamava `renderLogin(error.message)` e
  recriava tudo: apagava o e-mail digitado, perdia o foco e mostrava a mensagem
  crua do Supabase em inglês. Hoje muda só a linha de erro; o e-mail fica, a
  senha é limpa e o foco vai para ela. Copy própria em PT-BR — a mensagem do
  Supabase só decide **qual** copy aparece (credencial x rede), nunca vai à tela.
- **Sessão expirada tem caminho.** `encerrarSessaoUI()` é o ponto único: fecha
  folha/modal aberto, remove diálogo do DS, desliga o quiosque do Questionário,
  esconde header/nav/FAB e desenha o Login com "Sua sessão expirou. Entre
  novamente para continuar.". A **aba é preservada** para a volta; conteúdo não
  salvo de formulário ou wizard **não é** — e a tela não promete que seja.
- **Persistência da sessão continua a padrão do Supabase.** Sem "lembrar de
  mim", sem timeout próprio, sem logout por inatividade: é o dispositivo
  operacional do salão, e aumentar a frequência de login sem necessidade seria
  atrito diário.

## Armadilha que continua valendo

⚠ **Escrita autenticada precisa de `.select()` no fim.** Com a sessão expirada a
RLS deixa o `update` passar **sem tocar em linha nenhuma**. É daí que sai o
toast "faça login novamente" — e é ele que o gancho central de `showToast()`
usa para **confirmar** a sessão em `getSession()` antes de levar ao Login. A
string não decide nada sozinha.

Os três formulários que mostram erro **inline** em vez de toast (`#ncError`,
`#prodError`, `#wizNcError`) ficam fora desse gancho. Registrado em
[[Technical Debt]] — não vale um refactor geral de error handling.

## Fora de escopo, com registro

**Recuperação de senha não existe** — e não há link prometendo que exista. Está
no [[Product Backlog]] como *Password Recovery end-to-end*, que só entra
completo: solicitação → e-mail → callback seguro → nova senha → confirmação →
volta ao Login.

## Links

[[Splash]] · [[Product Backlog]] · [[Frontend Architecture]] ·
[[Technical Debt]] · [[Estado Atual do Produto]]
