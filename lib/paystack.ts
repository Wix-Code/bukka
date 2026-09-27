import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set.");
  }
  return key;
}

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok || json.status === false) {
    throw new Error(json.message || `Paystack request to ${path} failed.`);
  }

  return json.data as T;
}

export type PaystackInitializeResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  planCode: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  return paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      plan: params.planCode,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

// Verifies that a webhook request actually came from Paystack, using the
// raw (unparsed) request body — signature verification has to happen
// before the body is JSON-parsed, since it's a hash of the exact bytes sent.
export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");

  return expected === signatureHeader;
}
