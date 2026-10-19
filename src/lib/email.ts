import { Resend } from "resend";
import type { Order } from "@/lib/orders";
import { site } from "@/lib/site";

function orderEmail() {
  return process.env.ORDER_EMAIL || site.email;
}

function fromAddress() {
  return (
    process.env.RESEND_FROM || "MIRKA with love <beth.t@example.com>"
  );
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function orderText(order: Order) {
  const lines = [
    `Nova porudžbina ${order.id}`,
    `Datum: ${formatWhen(order.createdAt)}`,
    "",
    `Ime: ${order.buyer.name}`,
    `Telefon: ${order.buyer.phone}`,
    order.buyer.note ? `Napomena: ${order.buyer.note}` : "",
    "",
    "Stavke:",
    ...order.items.map(
      (item) => `• ${item.qty}× ${item.name} — ${item.priceLabel}`,
    ),
    "",
    `Ukupno: ${order.totalLabel}`,
  ];
  return lines.filter((line) => line !== "").join("\n");
}

function orderHtml(order: Order) {
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.name)}<br>
            <span style="color:#6d6460;font-size:13px;">${item.qty} × ${escapeHtml(item.priceLabel)}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${escapeHtml(item.priceLabel)}
          </td>
        </tr>`,
    )
    .join("");

  const note = order.buyer.note
    ? `<p style="margin:16px 0 0;color:#141110;"><strong>Napomena:</strong> ${escapeHtml(order.buyer.note)}</p>`
    : "";

  return `
  <div style="background:#efeae3;padding:32px 16px;font-family:Georgia,serif;color:#141110;">
    <div style="max-width:560px;margin:0 auto;background:#f6f2ec;padding:32px;">
      <p style="letter-spacing:.28em;text-transform:uppercase;font-size:11px;color:#6d6460;margin:0;">MIRKA with love</p>
      <h1 style="font-size:32px;margin:12px 0 8px;">Nova porudžbina</h1>
      <p style="margin:0;color:#6d6460;">${escapeHtml(order.id)} · ${escapeHtml(formatWhen(order.createdAt))}</p>
      <div style="margin:28px 0;padding:20px;background:#fff;">
        <p style="margin:0 0 6px;"><strong>${escapeHtml(order.buyer.name)}</strong></p>
        <p style="margin:0;"><a href="tel:${escapeHtml(order.buyer.phone)}" style="color:#141110;">${escapeHtml(order.buyer.phone)}</a></p>
        ${note}
      </div>
      <table style="width:100%;border-collapse:collapse;">${items}</table>
      <p style="font-size:24px;text-align:right;margin:24px 0 0;">${escapeHtml(order.totalLabel)}</p>
    </div>
  </div>`;
}

export async function sendOrderEmail(order: Order) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY nije podešen.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [orderEmail()],
    subject: `Nova porudžbina ${order.id} — ${order.buyer.name}`,
    text: orderText(order),
    html: orderHtml(order),
  });

  if (error) {
    throw new Error(error.message);
  }
}
