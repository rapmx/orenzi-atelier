# Login

**Estado: existe e funciona. Redesign NÃO iniciado — só backlog.**

## O que existe hoje

Autenticação do Supabase, no `painel.html`. Âncoras: `checkSession()`,
`renderLogin()`. É a única superfície autenticada do projeto — `agendar.html` e
`gerenciar.html` rodam com a chave anônima.

O grafo agrupa isso na comunidade **"Authentication"**.

## Estado da decisão

**Aprovado para revisão/redesign depois do refresh de 15/08/2026**, na fila
logo após [[Splash]]. Escopo não definido.

## Armadilha que o redesign não pode quebrar

⚠ **Escrita autenticada precisa de `.select()` no fim.** Com a sessão expirada
a RLS deixa o `update` passar **sem tocar em linha nenhuma**, e a tela mentiria
("salvo!") sem ter salvo nada.

Isso torna o comportamento de **sessão expirada** parte do escopo do redesign,
não um detalhe: hoje o app não tem uma tela honesta para esse estado.

## Perguntas em aberto

1. o que acontece quando a sessão expira no meio de uma edição?
2. "lembrar de mim" / sessão longa — a Juliane usa tablet compartilhado no salão
3. recuperação de senha existe? qual o caminho?
4. o login precisa de estado de erro/loading no padrão do DS (hoje é fraco)

## O que restringe o desenho

Tema claro · mobile 320–430px · `focus-visible` obrigatório (a auditoria de
03/08 achou **zero** ocorrência de `:focus-visible`, `<label for>`, `role=` e
`aria-live` no projeto inteiro — o login é um bom lugar para começar a corrigir)
· `docs/07_ACCESSIBILITY.md` tem **veto**.

## Links

[[Splash]] · [[Product Backlog]] · [[Frontend Architecture]] ·
[[Technical Debt]]
