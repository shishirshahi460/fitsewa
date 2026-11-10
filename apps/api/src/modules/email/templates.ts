import type { EmailMessage } from "./provider.js";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

function layout(title: string, body: string, link: string, button: string, footer: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#F5F5EF;padding:24px"><div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:24px;color:#202923">
<p style="font-size:20px;font-weight:700;color:#173C32;margin:0 0 16px">FitSewa</p><h1 style="font-size:18px;margin:0 0 12px">${esc(title)}</h1>
<p style="margin:0 0 20px;line-height:1.5">${esc(body)}</p>
<a href="${esc(link)}" style="display:inline-block;background:#173C32;color:#F5F5EF;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600">${esc(button)}</a>
<p style="margin:20px 0 0;font-size:12px;color:#5A645D;line-height:1.5">${esc(footer)}<br>If the button does not work, copy this link into your browser:<br>${esc(link)}</p></div></div>`;
}

export function verifyEmailMessage(to: string, link: string): EmailMessage {
  const body = "Confirm your email address to finish setting up your FitSewa account.";
  const footer = "This link works for 24 hours. If you did not create a FitSewa account, you can ignore this email.";
  return { to, subject: "Confirm your FitSewa email", text: `${body}\n\n${link}\n\n${footer}`, html: layout("Confirm your email", body, link, "Confirm email", footer) };
}

export function resetEmailMessage(to: string, link: string): EmailMessage {
  const body = "We received a request to reset your FitSewa password.";
  const footer = "This link works for 1 hour and can be used once. If you did not ask for this, you can ignore this email; your password will not change.";
  return { to, subject: "Reset your FitSewa password", text: `${body}\n\n${link}\n\n${footer}`, html: layout("Reset your password", body, link, "Choose a new password", footer) };
}