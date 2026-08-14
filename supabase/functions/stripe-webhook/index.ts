import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";

// ═══════════════════════════════════════════════════════════════════════════
// STRIPE WEBHOOK — SANDBOX/TEST MODE
//
// Function SEPARADA do booking-orchestrator de proposito. As duas sao publicas,
// mas autenticam de formas incompativeis:
//   - booking-orchestrator: chamada pelo BROWSER da cliente, com JWT do Supabase;
//   - stripe-webhook:       chamada pelo STRIPE, autenticada SO por assinatura
//                           HMAC, e precisa do corpo CRU (req.text()).
// Juntar as duas seria uma superficie com dois modelos de auth e um parser
// condicional. Separado, cada uma tem uma regra so.
//
// deploy: verify_jwt = false. NAO e um buraco: sem assinatura valida do Stripe
// nada e lido do payload — a verificacao acontece ANTES de qualquer uso.
//
// ⚠ NENHUM refund e disparado por este codigo. charge.refunded so REGISTRA o
//   que ja aconteceu no Stripe. Politica financeira de cancelamento (policy v2)
//   ainda nao foi decidida pela Juliane.
//
// ⚠ LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const MANAGE_BASE_URL = Deno.env.get("MANAGE_BASE_URL") ?? "https://orenziatelier.com/gerenciar.html";
const SALON_TIMEZONE = "Europe/Dublin";
const LOCALE = "pt-BR";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Deno nao tem o crypto sincrono que o SDK usa por padrao — daqui sai o
// provider assincrono que constructEventAsync exige.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Eventos que este endpoint trata. Qualquer outro recebe 200 e e ignorado:
// devolver erro faria o Stripe reentregar por 3 dias um evento que nunca vai
// ser processado.
const HANDLED = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "charge.refunded",
]);

function money(cents: number, currency = "eur") {
  const v = (cents / 100).toFixed(2).replace(/\.00$/, "");
  return currency === "eur" ? `€${v}` : `${v} ${currency.toUpperCase()}`;
}

function fmt(startsAt: string) {
  const d = new Date(startsAt);
  return {
    dateLabel: d.toLocaleDateString(LOCALE, { day: "2-digit", month: "long", timeZone: SALON_TIMEZONE }),
    timeLabel: d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: SALON_TIMEZONE }),
  };
}

// Copia deliberada de buildEmail() do booking-orchestrator, acrescida das tres
// linhas de dinheiro. Duplicar helper pequeno e a convencao do projeto (os
// arquivos nao compartilham modulo); redesign premium do template fica pra
// depois, como combinado.
function buildCreatedEmail(d: {
  clientName?: string; serviceNames: string; staffName?: string;
  dateLabel: string; timeLabel: string; manageLink: string | null;
  totalCents: number; depositCents: number; balanceCents: number; currency: string;
}) {
  const manageBlock = d.manageLink
    ? `<p><a href="${d.manageLink}" style="color:#8c491a;">Gerenciar agendamento</a></p>`
    : "";
  return {
    subject: "Seu agendamento no Orenzi está confirmado",
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#8c491a;">Agendamento confirmado!</h2>
      <p>Olá, ${d.clientName || "cliente"}!</p>
      <p>Seu horário no <strong>Orenzi</strong> está confirmado:</p>
      <ul>
        <li><strong>Serviço(s):</strong> ${d.serviceNames}</li>
        <li><strong>Profissional:</strong> ${d.staffName || ""}</li>
        <li><strong>Data:</strong> ${d.dateLabel}</li>
        <li><strong>Horário:</strong> ${d.timeLabel}</li>
      </ul>
      <ul>
        <li><strong>Total:</strong> ${money(d.totalCents, d.currency)}</li>
        <li><strong>Sinal pago:</strong> ${money(d.depositCents, d.currency)}</li>
        <li><strong>Restante no atendimento:</strong> ${money(d.balanceCents, d.currency)}</li>
      </ul>
      ${manageBlock}
      <p>Até breve!</p>
    </div>`,
  };
}

// Mesma Idempotency-Key do fluxo antigo (`created:{request_key}`): o e-mail de
// confirmacao continua sendo UM por booking, mesmo que o webhook seja
// reentregue com um event_id novo.
async function sendEmail(requestKey: string, to: string | null, subject: string, html: string) {
  if (!to || !RESEND_API_KEY) return { attempted: false, ok: false };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `created:${requestKey}`,
    },
    body: JSON.stringify({ from: "Orenzi <onboarding@resend.dev>", to: [to], subject, html }),
  });
  return { attempted: true, ok: res.ok };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }
  // Diz QUAL secret falta, nunca o valor. Nome de variavel de ambiente nao e
  // segredo, e o endpoint continua inerte sem assinatura valida — mas sem esta
  // distincao um "not_configured" generico custa um ciclo inteiro de deploy
  // pra descobrir qual das duas nao chegou (aconteceu no E2E de 14/08/2026).
  if (!STRIPE_SECRET_KEY) {
    console.error("stripe-webhook: STRIPE_SECRET_KEY ausente");
    return new Response("not_configured:STRIPE_SECRET_KEY", { status: 500 });
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET ausente");
    return new Response("not_configured:STRIPE_WEBHOOK_SECRET", { status: 500 });
  }
  if (!STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    console.error("stripe-webhook: chave nao-test recusada (live bloqueado)");
    return new Response("live_blocked", { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
    httpClient: Stripe.createFetchHttpClient(),
  });

  // ── CORPO CRU antes de qualquer parsing. req.json() aqui quebraria a
  //    verificacao: a assinatura e calculada sobre os bytes exatos.
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing_signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw, signature, STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider,
    );
  } catch (err) {
    // Assinatura invalida: 400 e fim. Nada do payload e lido.
    console.error("stripe-webhook: assinatura invalida", (err as Error)?.message);
    return new Response("invalid_signature", { status: 400 });
  }

  // Daqui pra baixo o payload esta verificado.
  if (!HANDLED.has(event.type)) {
    return new Response(JSON.stringify({ received: true, handled: false }), { status: 200 });
  }

  // O id do PaymentIntent sai do objeto certo conforme o tipo: charge.refunded
  // carrega o Charge, nao o PaymentIntent.
  let paymentIntentId: string | null = null;
  let amountRefunded = 0;
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    paymentIntentId = typeof charge.payment_intent === "string"
      ? charge.payment_intent : charge.payment_intent?.id ?? null;
    amountRefunded = charge.amount_refunded ?? 0;
  } else {
    paymentIntentId = (event.data.object as Stripe.PaymentIntent).id;
  }

  // Dedup + efeito + marcacao de processado numa TRANSACAO SO, dentro do
  // banco. Se qualquer parte falhar, a linha de stripe_webhook_events some
  // junto e o Stripe reentrega — que e o comportamento desejado.
  const { data, error } = await admin.rpc("handle_stripe_event", {
    p_event_id: event.id,
    p_type: event.type,
    p_payment_intent_id: paymentIntentId,
    p_payload: { amount_refunded: amountRefunded },
  });

  if (error) {
    // NAO responder 200: o Stripe precisa reentregar.
    console.error("stripe-webhook: handle_stripe_event falhou", error.message);
    return new Response("handler_failed", { status: 500 });
  }

  // Refund manual necessario (pagou e o horario ja nao existia). Nada e
  // estornado automaticamente — so fica registrado e visivel.
  if (data?.action === "manual_refund_needed") {
    console.error("stripe-webhook: REFUND MANUAL NECESSARIO", {
      appointment_id: data.appointment_id, appointment_status: data.appointment_status,
    });
    return new Response(JSON.stringify({ received: true, action: data.action }), { status: 200 });
  }

  // E-mail de confirmacao: SO depois de succeeded, e so numa confirmacao
  // fresca. O manage_token bruto e gerado dentro da transacao acima, trafega
  // ate aqui, entra no corpo do e-mail e morre — nunca fica em disco.
  if (data?.action === "send_created_email") {
    const { dateLabel, timeLabel } = fmt(data.starts_at);
    const serviceNames = (data.services || []).map((s: any) => s.name).join(" + ");
    const { subject, html } = buildCreatedEmail({
      clientName: data.client_name,
      serviceNames,
      staffName: data.staff?.name,
      dateLabel, timeLabel,
      manageLink: `${MANAGE_BASE_URL}?t=${encodeURIComponent(data.manage_token)}`,
      totalCents: data.total_cents,
      depositCents: data.deposit_cents,
      balanceCents: data.balance_cents,
      currency: data.currency ?? "eur",
    });
    // Falha de e-mail NAO pode fazer o Stripe reentregar: o booking ja esta
    // confirmado e reentregar so repetiria o efeito ja aplicado.
    try {
      await sendEmail(data.request_key, data.client_email, subject, html);
    } catch (e) {
      console.error("stripe-webhook: e-mail falhou", (e as Error)?.message);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
