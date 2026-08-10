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
  if (!event_type || !request_key || !payload) {
    return new Response(JSON.stringify({ operation_success: false, code: "invalid_request" }), { status: 400, headers: jsonHeaders });
  }

  try {
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
