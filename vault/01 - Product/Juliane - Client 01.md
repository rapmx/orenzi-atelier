# Juliane — Client #01

**Quem é.** Dona do Orenzi Atelier, salão em Dublin, Irlanda. **Cliente real,
em uso** — não é protótipo, não é demo.

## O que isso implica na prática

- **Dado é dado.** Não inserir teste em `appointments` (dispara e-mail real).
- **Regressão custa.** Toda mudança de tela entra em `painel.html` **e**
  `painel_demo.html`.
- **Ela é a única profissional ativa.** As outras existem com `active = false`
  por causa do histórico. Onde há uma só, a escolha de profissional some da
  interface — e volta sozinha se uma segunda for reativada.

## Decisões que vieram dela

| Decisão | Registro |
|---|---|
| Tema escuro recusado | [[ADR 0001 - Tema escuro recusado]] |
| Questionário permanece consulta manual | [[ADR 0010 - Questionario e consulta manual]] |
| Cabeçalho da Agenda sempre compacto, sem colapso ao rolar | ver [[Agenda]] |

## O que depende dela para destravar

Cinco coisas, todas fora do controle do time técnico:

1. **fotos reais** das referências visuais do Questionário
2. **Cancellation Policy V2** — trava pagamento live
3. **onboarding Stripe** (KYC/IBAN)
4. **WhatsApp Business**
5. **domínio + verificação Resend**

Detalhe e impacto de cada uma em [[Waiting on Juliane]].

## Perfil de uso

Tablet no salão (entrega para a cliente responder o questionário) + celular.
**Mobile é a fonte de verdade**, 320–430px. Em desktop o app fica centralizado,
nunca esticado na viewport inteira.

## Links

[[Product Scope]] · [[Waiting on Juliane]] · [[Production Blockers]] ·
[[Questionario]]
