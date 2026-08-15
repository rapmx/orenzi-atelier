import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Segredo compartilhado só entre o gatilho do banco e esta function.
// Impede que qualquer pessoa na internet chame essa function diretamente.
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// ── Fuso do estabelecimento ────────────────────────────────────────────────
// O Deno da Supabase roda em UTC. Sem `timeZone` explícito, toLocale*String
// formatava o instante em UTC: no horário de verão irlandês o e-mail mostrava
// uma hora A MENOS que a tela e o painel, e um agendamento na primeira meia
// hora do dia aparecia com a DATA do dia anterior. O instante gravado em
// `appointments` sempre esteve certo — só a apresentação estava errada.
//
// IANA, nunca offset fixo: 'Europe/Dublin' cobre a virada do horário de verão
// sozinho. 'UTC+1', 'GMT' ou 'IST' quebrariam duas vezes por ano.
//
// Ordem de resolução pensada para o futuro multi-tenant: quando o payload
// passar a trazer o fuso do estabelecimento (business.timezone / tenant.timezone),
// esta função já o respeita sem precisar de deploy novo. Enquanto isso, cai no
// padrão do salão. Nada de tabela ou configuração nova agora.
const DEFAULT_TIMEZONE = "Europe/Dublin";
const DEFAULT_LOCALE = "pt-BR";

function resolveTimezone(payloadTimezone?: unknown): string {
  if (typeof payloadTimezone === "string" && payloadTimezone.length > 0) {
    return payloadTimezone;
  }
  return Deno.env.get("SALON_TIMEZONE") ?? DEFAULT_TIMEZONE;
}

// Formata o instante absoluto como o salão o lê, não como o servidor o lê.
function formatForSalon(startsAt: string, timeZone: string, locale = DEFAULT_LOCALE) {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) {
    return { valid: false as const, dateLabel: "", timeLabel: "" };
  }
  return {
    valid: true as const,
    dateLabel: date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "long",
      timeZone,
    }),
    timeLabel: date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }),
  };
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();
    const { client_name, client_email, service_name, staff_name, starts_at } = payload;

    const timeZone = resolveTimezone(payload.timezone);
    const { valid, dateLabel, timeLabel } = formatForSalon(starts_at, timeZone);

    // Os rótulos são calculados ANTES da saída antecipada e devolvidos na
    // resposta: é o que permite conferir a formatação de ponta a ponta (nos
    // logs / net._http_response) sem precisar disparar e-mail de verdade.
    const debug = { timezone: timeZone, date_label: dateLabel, time_label: timeLabel };

    if (!client_email) {
      return new Response(JSON.stringify({ skipped: "no client email", ...debug }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orenzi <onboarding@resend.dev>",
        to: [client_email],
        subject: "Seu agendamento no Orenzi está confirmado",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color:#8c491a;">Agendamento confirmado!</h2>
            <p>Olá, ${client_name || "cliente"}!</p>
            <p>Seu horário no <strong>Orenzi</strong> está confirmado:</p>
            <ul>
              <li><strong>Serviço:</strong> ${service_name || ""}</li>
              <li><strong>Profissional:</strong> ${staff_name || ""}</li>
              <li><strong>Data:</strong> ${dateLabel}</li>
              <li><strong>Horário:</strong> ${timeLabel}</li>
            </ul>
            <p>Até breve!</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json();

    return new Response(JSON.stringify({ ok: emailRes.ok, valid, ...debug, emailData }), {
      headers: { "Content-Type": "application/json" },
      status: emailRes.ok ? 200 : 500,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
