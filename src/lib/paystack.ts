import crypto from "node:crypto";

const PAYSTACK_API = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY in .env.");
  }
  return key;
}

export async function initializeTransaction(params: {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKes * 100,
      currency: "KES",
      reference: params.reference,
      callback_url: params.callbackUrl,
      channels: ["card", "mobile_money"],
      metadata: params.metadata ?? {},
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Failed to start payment with Paystack");
  }
  return json.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getSecretKey()}` },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Failed to verify payment with Paystack");
  }

  const data = json.data;
  return {
    status: data.status as string,
    amountKobo: data.amount as number,
    currency: data.currency as string,
    reference: data.reference as string,
    metadata: data.metadata as Record<string, unknown> | null,
  };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
