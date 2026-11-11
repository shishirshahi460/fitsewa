import type { Config } from "../../config.js";

export interface EmailMessage { to: string; subject: string; text: string; html: string }

/** Sends via Resend's HTTP API. Without an API key: dev prints the email, production reports an error. */
export async function sendEmail(config: Config, msg: EmailMessage): Promise<void> {
  if (!config.RESEND_API_KEY) {
    if (config.isProd) throw new Error("Email provider is not configured"); // never pretend an email was sent
    console.log(`\n[email:dev] To: ${msg.to}\nSubject: ${msg.subject}\n${msg.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: config.EMAIL_FROM, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!res.ok) throw new Error(`Email provider responded with status ${res.status}`);
}