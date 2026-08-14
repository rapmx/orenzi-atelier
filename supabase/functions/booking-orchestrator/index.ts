import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Browser = UX. Edge = orchestration + notification. RPC = business authority.
// service_role key SO existe aqui, nunca no browser. O manage_token bruto
// trafega HTTPS -> memoria desta function -> corpo do email -> [fim]. Nunca
// toca pg_net, nunca uma tabela, nunca um log do Postgres.
//
// CORS: e um endpoint publico por natureza (chamado direto do browser da
// cliente) e a seguranca dele vem da validacao dentro das RPCs, nao da
// origem da chamada -- allow-all aqui nao abre nada que o backend ja nao
// tivesse que proteger sozinho.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Config por env/secret -- NAO editar este arquivo pra trocar o dominio.
// Definir MANAGE_BASE_URL como secret da function quando o dominio de
// producao existir (ver "Remaining Before Push" no checkpoint do repo).
const MANAGE_BASE_URL = Deno.env.get("MANAGE_BASE_URL") ?? "https://orenziatelier.com/gerenciar.html";
const SALON_TIMEZONE = "Europe/Dublin";
const LOCALE = "pt-BR";

// ── STRIPE (SANDBOX/TEST MODE) ───────────────────────────────────────────
// sk_test_... vive SO aqui, como secret da function. Nunca no source, nunca
// no browser. A publishable pk_test_ e que vai pro agendar.html — e publica
// por desenho do proprio Stripe.
//
// ⚠ LIVE PAYMENTS BLOCKED UNTIL CANCELLATION POLICY V2 IS APPROVED.
//   A policy v1 corrente promete taxa fixa de EUR 16 e diz que o sinal e
//   descontado dela. Com deposito de 20% isso implica devolver dinheiro em
//   cancelamento tardio — regra financeira que ainda nao foi decidida.
//   Este guard recusa qualquer chave que nao seja de teste.
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const HOLD_MINUTES_INITIAL = 12;
const HOLD_MINUTES_ON_PAYMENT = 15;

// Import DINAMICO, nao no topo do arquivo. Esta function carrega o Booking
// publico inteiro (created/rescheduled/cancelled) e ja esta em producao: um
// import estatico de npm:stripe que falhasse ao resolver derrubaria TAMBEM o
// agendamento, que nao tem nada a ver com pagamento. Assim, no pior caso, so
// o caminho de pagamento cai — e cai devolvendo 503, nao 500.
let stripeSingleton: any = null;
async function stripeClient(): Promise<any | null> {
  if (!STRIPE_SECRET_KEY) return null;
  if (!STRIPE_SECRET_KEY.startsWith("sk_test_")) return null;   // live bloqueado
  if (stripeSingleton) return stripeSingleton;
  try {
    const { default: Stripe } = await import("npm:stripe@18");
    stripeSingleton = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
      httpClient: Stripe.createFetchHttpClient(),
    });
    return stripeSingleton;
  } catch (err) {
    console.error("stripe: falha ao carregar o SDK", (err as Error)?.message);
    return null;
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function fmt(startsAt: string) {
  const d = new Date(startsAt);
  return {
    dateLabel: d.toLocaleDateString(LOCALE, { day: "2-digit", month: "long", timeZone: SALON_TIMEZONE }),
    timeLabel: d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: SALON_TIMEZONE }),
  };
}

function manageUrl(token: string) {
  return `${MANAGE_BASE_URL}?t=${encodeURIComponent(token)}`;
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// reschedule/cancel: o browser (gerenciar.html) NUNCA tem o e-mail da cliente
// -- get_booking_by_token deliberadamente nao devolve PII. A Edge, rodando
// como service_role (ignora RLS), busca diretamente pelo hash do token --
// mesma chave que a RPC usa -- sem que esse dado passe por nenhuma resposta
// publica em momento algum.
async function lookupByToken(token: string) {
  const tokenHash = await sha256Hex(token);
  const { data } = await admin
    .from("appointments")
    .select("id, clients(email), appointment_services(service_name_snapshot, sort_order)")
    .eq("manage_token_hash", tokenHash)
    .maybeSingle();
  if (!data) return { email: null as string | null, serviceNames: "" };
  const email = (data as any).clients?.email ?? null;
  const services = ((data as any).appointment_services ?? [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((s: any) => s.service_name_snapshot)
    .join(" + ");
  return { email, serviceNames: services };
}

function buildEmail(eventType: "created" | "rescheduled" | "cancelled", data: {
  clientName?: string; serviceNames: string; staffName?: string;
  dateLabel: string; timeLabel: string; manageLink: string | null;
}) {
  const { clientName, serviceNames, staffName, dateLabel, timeLabel, manageLink } = data;
  const manageBlock = manageLink
    ? `<p><a href="${manageLink}" style="color:#8c491a;">Gerenciar agendamento</a></p>`
    : "";

  if (eventType === "created") {
    return {
      subject: "Seu agendamento no Orenzi está confirmado",
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#8c491a;">Agendamento confirmado!</h2>
        <p>Olá, ${clientName || "cliente"}!</p>
        <p>Seu horário no <strong>Orenzi</strong> está confirmado:</p>
        <ul>
          <li><strong>Serviço(s):</strong> ${serviceNames}</li>
          <li><strong>Profissional:</strong> ${staffName || ""}</li>
          <li><strong>Data:</strong> ${dateLabel}</li>
          <li><strong>Horário:</strong> ${timeLabel}</li>
        </ul>
        ${manageBlock}
        <p>Até breve!</p>
      </div>`,
    };
  }
  if (eventType === "rescheduled") {
    return {
      subject: "Seu agendamento no Orenzi foi reagendado",
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#8c491a;">Agendamento reagendado</h2>
        <p>Olá!</p>
        <p>Seu horário no <strong>Orenzi</strong> foi alterado para:</p>
        <ul>
          <li><strong>Serviço(s):</strong> ${serviceNames}</li>
          <li><strong>Profissional:</strong> ${staffName || ""}</li>
          <li><strong>Nova data:</strong> ${dateLabel}</li>
          <li><strong>Novo horário:</strong> ${timeLabel}</li>
        </ul>
        ${manageBlock}
        <p>Até breve!</p>
      </div>`,
    };
  }
  return {
    subject: "Seu agendamento no Orenzi foi cancelado",
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#8c491a;">Agendamento cancelado</h2>
      <p>Olá!</p>
      <p>Confirmamos o cancelamento do seu horário no <strong>Orenzi</strong>:</p>
      <ul>
        <li><strong>Serviço(s):</strong> ${serviceNames}</li>
        <li><strong>Profissional:</strong> ${staffName || ""}</li>
        <li><strong>Data:</strong> ${dateLabel}</li>
        <li><strong>Horário:</strong> ${timeLabel}</li>
      </ul>
      <p>Esperamos te ver em breve.</p>
    </div>`,
  };
}

async function sendEmail(eventType: string, requestKey: string, to: string | null, subject: string, html: string) {
  if (!to) return { attempted: false, ok: false, id: null as string | null };
  if (!RESEND_API_KEY) return { attempted: false, ok: false, id: null as string | null };

  const idempotencyKey = `${eventType}:${requestKey}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ from: "Orenzi <onboarding@resend.dev>", to: [to], subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  return { attempted: true, ok: res.ok, id: (data && data.id) || null };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  const jsonHeaders = { "Content-Type": "application/json", ...CORS_HEADERS };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ operation_success: false, code: "method_not_allowed" }), { status: 405, headers: jsonHeaders });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ operation_success: false, code: "invalid_request" }), { status: 400, headers: jsonHeaders });
  }

  const { event_type, request_key, payload } = body ?? {};
  // booking_state e so uma consulta pela request_key — nao carrega payload.
  const needsPayload = event_type !== "booking_state";
  if (!event_type || !request_key || (needsPayload && !payload)) {
    return new Response(JSON.stringify({ operation_success: false, code: "invalid_request" }), { status: 400, headers: jsonHeaders });
  }

  try {
    // ── payment_intent: hold + deposito de 20% + PaymentIntent (sandbox) ──
    // A ORDEM importa: o hold nasce ANTES do cartao aparecer. E isso que faz
    // "pagou e perdeu o horario" ser impossivel — o slot ja e dela quando o
    // Payment Element monta.
    if (event_type === "payment_intent") {
      const stripe = await stripeClient();
      if (!stripe) {
        return new Response(JSON.stringify({ operation_success: false, code: "payments_unavailable" }),
          { status: 503, headers: jsonHeaders });
      }

      // 1) Hold. Retry do browser com a MESMA request_key devolve o MESMO
      //    appointment_id (replay), nunca um segundo hold.
      const { data: hold, error: holdErr } = await admin.rpc("create_booking_hold_orchestrated", {
        p_request_key: request_key,
        p_service_ids: payload.service_ids,
        p_staff_pref: payload.staff_pref ?? null,
        p_starts_at: payload.starts_at,
        p_client_name: payload.name,
        p_client_phone: payload.phone,
        p_client_email: payload.email,
        p_notes: payload.notes ?? null,
        p_policy_accepted: payload.policy_accepted === true,
        p_hold_minutes: HOLD_MINUTES_INITIAL,
      });
      if (holdErr) {
        return new Response(JSON.stringify({ operation_success: false, code: holdErr.message }),
          { status: 400, headers: jsonHeaders });
      }

      // Ja confirmado (replay depois do webhook): nao cria PaymentIntent novo.
      if (hold.status === "confirmed") {
        return new Response(JSON.stringify({ operation_success: true, already_confirmed: true }),
          { status: 200, headers: jsonHeaders });
      }

      // 2) Preco: SEMPRE do servidor, a partir dos service_ids reais.
      //    O browser nunca manda valor e o amount do Stripe nunca deriva dele.
      const { data: dep, error: depErr } = await admin.rpc("deposit_for_services", {
        p_service_ids: payload.service_ids,
      });
      const money = Array.isArray(dep) ? dep[0] : dep;
      if (depErr || !money || !(money.deposit_cents > 0)) {
        return new Response(JSON.stringify({ operation_success: false, code: "invalid_service" }),
          { status: 400, headers: jsonHeaders });
      }

      // 3) PaymentIntent. A idempotency key amarra UM PaymentIntent por
      //    tentativa logica: retry com a mesma request_key devolve o mesmo
      //    objeto do Stripe em vez de criar (e cobrar) outro.
      //    Metadata so o minimo de reconciliacao — sem telefone, e-mail,
      //    observacoes ou token.
      const intent = await stripe.paymentIntents.create({
        amount: money.deposit_cents,
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        metadata: {
          request_key,
          appointment_id: hold.appointment_id,
          booking_reference: hold.booking_reference ?? "",
        },
      }, { idempotencyKey: `pi:${request_key}` });

      // 4) Registra o pagamento. Idempotente pelo UNIQUE do PaymentIntent id.
      await admin.rpc("register_payment_intent", {
        p_request_key: request_key,
        p_appointment_id: hold.appointment_id,
        p_payment_intent_id: intent.id,
        p_amount_total_cents: money.total_cents,
        p_amount_cents: money.deposit_cents,
        p_currency: "eur",
        p_status: intent.status,
      });

      if (intent.status === "succeeded") {
        return new Response(JSON.stringify({ operation_success: true, already_paid: true }),
          { status: 200, headers: jsonHeaders });
      }

      // 5) Estende o hold: dai pra frente a cliente pode ficar minutos numa
      //    tela de 3DS do banco dela.
      const { data: newExpiry } = await admin.rpc("extend_booking_hold", {
        p_request_key: request_key, p_minutes: HOLD_MINUTES_ON_PAYMENT,
      });

      // client_secret e semi-segredo por desenho do Stripe: vai pro browser,
      // mas NUNCA e gravado nem logado deste lado.
      return new Response(JSON.stringify({
        operation_success: true,
        client_secret: intent.client_secret,
        total_cents: money.total_cents,
        deposit_cents: money.deposit_cents,
        balance_cents: money.total_cents - money.deposit_cents,
        currency: "eur",
        hold_expires_at: newExpiry ?? hold.hold_expires_at ?? null,
      }), { status: 200, headers: jsonHeaders });
    }

    // ── booking_state: o polling. Autoridade da confirmacao e o servidor. ──
    if (event_type === "booking_state") {
      const { data, error } = await admin.rpc("get_booking_state_by_request_key", {
        p_request_key: request_key,
      });
      if (error) {
        return new Response(JSON.stringify({ operation_success: false, code: "internal_error" }),
          { status: 400, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ operation_success: true, state: data }),
        { status: 200, headers: jsonHeaders });
    }

    if (event_type === "created") {
      const { data, error } = await admin.rpc("create_public_booking_orchestrated", {
        p_request_key: request_key,
        p_service_ids: payload.service_ids,
        p_staff_pref: payload.staff_pref ?? null,
        p_starts_at: payload.starts_at,
        p_client_name: payload.name,
        p_client_phone: payload.phone,
        p_client_email: payload.email,
        p_notes: payload.notes ?? null,
        p_policy_accepted: payload.policy_accepted === true,
      });
      if (error) {
        return new Response(JSON.stringify({ operation_success: false, code: error.message }), { status: 400, headers: jsonHeaders });
      }

      // manage_token so vem preenchido numa conclusao FRESCA. Num replay ele
      // vem null -- e e exatamente por isso que o email NUNCA e reenviado no
      // replay: o corpo mudaria (link presente vs ausente) para a MESMA
      // Idempotency-Key, o que o Resend corretamente rejeitaria com 409
      // (chave repetida + payload diferente). Reenviar so quando fresco
      // mantem o payload deterministico por natureza.
      let emailResult = { attempted: false, ok: false, id: null as string | null };
      if (data.manage_token) {
        const { dateLabel, timeLabel } = fmt(data.starts_at);
        const serviceNames = (data.services || []).map((s: any) => s.name).join(" + ");
        const manageLink = manageUrl(data.manage_token);
        const { subject, html } = buildEmail("created", {
          clientName: payload.name, serviceNames, staffName: data.staff?.name,
          dateLabel, timeLabel, manageLink,
        });
        emailResult = await sendEmail("created", request_key, payload.email, subject, html);
      }

      return new Response(JSON.stringify({
        operation_success: true,
        email_success: emailResult.attempted ? emailResult.ok : null,
        booking: data,
        manage_token: data.manage_token ?? null,
      }), { status: 200, headers: jsonHeaders });
    }

    if (event_type === "rescheduled") {
      const { data, error } = await admin.rpc("reschedule_booking_by_token_orchestrated", {
        p_request_key: request_key,
        p_token: payload.token,
        p_new_starts_at: payload.new_starts_at,
      });
      if (error) {
        return new Response(JSON.stringify({ operation_success: false, code: error.message }), { status: 400, headers: jsonHeaders });
      }

      const { email, serviceNames } = await lookupByToken(payload.token);
      const { dateLabel, timeLabel } = fmt(data.starts_at);
      const { subject, html } = buildEmail("rescheduled", {
        serviceNames, staffName: data.staff?.name, dateLabel, timeLabel,
        manageLink: manageUrl(payload.token),
      });
      const emailResult = await sendEmail("rescheduled", request_key, email, subject, html);

      return new Response(JSON.stringify({
        operation_success: true,
        email_success: emailResult.attempted ? emailResult.ok : null,
        booking: data,
      }), { status: 200, headers: jsonHeaders });
    }

    if (event_type === "cancelled") {
      const { email } = await lookupByToken(payload.token);
      const { data, error } = await admin.rpc("cancel_booking_by_token_orchestrated", {
        p_request_key: request_key,
        p_token: payload.token,
      });
      if (error) {
        return new Response(JSON.stringify({ operation_success: false, code: error.message }), { status: 400, headers: jsonHeaders });
      }

      const { dateLabel, timeLabel } = fmt(data.starts_at);
      const serviceNames = (data.services || []).map((s: any) => s.name).join(" + ");
      const { subject, html } = buildEmail("cancelled", {
        serviceNames, staffName: data.staff?.name, dateLabel, timeLabel, manageLink: null,
      });
      const emailResult = await sendEmail("cancelled", request_key, email, subject, html);

      return new Response(JSON.stringify({
        operation_success: true,
        email_success: emailResult.attempted ? emailResult.ok : null,
        booking: data,
      }), { status: 200, headers: jsonHeaders });
    }

    return new Response(JSON.stringify({ operation_success: false, code: "invalid_event_type" }), { status: 400, headers: jsonHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ operation_success: false, code: "internal_error" }), { status: 500, headers: jsonHeaders });
  }
});
