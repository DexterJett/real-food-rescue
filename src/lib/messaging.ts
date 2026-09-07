import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export type MessageChannel = "EMAIL" | "WHATSAPP";
export type MessageStatus = "SENT" | "DEMO" | "FAILED";

async function record(input: {
  userId: string;
  listingId?: string | null;
  channel: MessageChannel;
  to: string;
  subject: string;
  body: string;
  status: MessageStatus;
  error?: string;
}) {
  await prisma.outboundMessage.create({
    data: {
      userId: input.userId,
      listingId: input.listingId ?? null,
      channel: input.channel,
      to: input.to,
      subject: input.subject,
      body: input.body,
      status: input.status,
      error: input.error,
    },
  });
}

async function sendSmtpEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) return { ok: false as const, reason: "SMTP nicht konfiguriert" };

  const nodemailerTransport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  await nodemailerTransport.sendMail({ from, to, subject, text });
  return { ok: true as const };
}

async function sendTwilioWhatsapp(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    return { ok: false as const, reason: "WhatsApp/Twilio nicht konfiguriert" };
  }

  const params = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: body,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    return { ok: false as const, reason: detail.slice(0, 300) };
  }
  return { ok: true as const };
}

export async function sendListingEmail(input: {
  userId: string;
  listingId: string;
  to: string;
  subject: string;
  body: string;
}) {
  try {
    const result = await sendSmtpEmail(input.to, input.subject, input.body);
    await record({
      ...input,
      channel: "EMAIL",
      status: result.ok ? "SENT" : "DEMO",
      error: result.ok ? undefined : result.reason,
    });
  } catch (error) {
    await record({
      ...input,
      channel: "EMAIL",
      status: "FAILED",
      error: error instanceof Error ? error.message : "E-Mail fehlgeschlagen",
    });
  }
}

export async function sendListingWhatsapp(input: {
  userId: string;
  listingId: string;
  to: string;
  body: string;
}) {
  try {
    const result = await sendTwilioWhatsapp(input.to, input.body);
    await record({
      ...input,
      channel: "WHATSAPP",
      subject: "WhatsApp",
      status: result.ok ? "SENT" : "DEMO",
      error: result.ok ? undefined : result.reason,
    });
  } catch (error) {
    await record({
      ...input,
      channel: "WHATSAPP",
      subject: "WhatsApp",
      status: "FAILED",
      error: error instanceof Error ? error.message : "WhatsApp fehlgeschlagen",
    });
  }
}
