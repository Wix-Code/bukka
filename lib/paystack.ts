// import crypto from "crypto";

// const PAYSTACK_BASE_URL = "https://api.paystack.co";

// function secretKey(): string {
//   const key = process.env.PAYSTACK_SECRET_KEY;
//   if (!key) {
//     throw new Error("PAYSTACK_SECRET_KEY is not set.");
//   }
//   return key;
// }

// async function paystackFetch<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       Authorization: `Bearer ${secretKey()}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   });

//   const json = await res.json();

//   if (!res.ok || json.status === false) {
//     throw new Error(json.message || `Paystack request to ${path} failed.`);
//   }

//   return json.data as T;
// }

// export type PaystackInitializeResponse = {
//   authorization_url: string;
//   access_code: string;
//   reference: string;
// };

// export function initializeTransaction(params: {
//   email: string;
//   amountKobo: number;
//   planCode: string;
//   callbackUrl: string;
//   metadata: Record<string, unknown>;
// }) {
//   return paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
//     method: "POST",
//     body: JSON.stringify({
//       email: params.email,
//       amount: params.amountKobo,
//       plan: params.planCode,
//       callback_url: params.callbackUrl,
//       metadata: params.metadata,
//     }),
//   });
// }

// // Verifies that a webhook request actually came from Paystack, using the
// // raw (unparsed) request body — signature verification has to happen
// // before the body is JSON-parsed, since it's a hash of the exact bytes sent.
// export function verifyPaystackSignature(
//   rawBody: string,
//   signatureHeader: string | null,
// ): boolean {
//   if (!signatureHeader) return false;

//   const expected = crypto
//     .createHmac("sha512", secretKey())
//     .update(rawBody)
//     .digest("hex");

//   return expected === signatureHeader;
// }

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

  const raw = await res.text();

  let json: {
    status?: boolean;
    message?: string;
    data?: T;
  };

  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    console.error("Invalid Paystack response:", {
      path,
      status: res.status,
      body: raw,
    });

    throw new Error(`Paystack returned an invalid response for ${path}.`);
  }

  if (!res.ok || json.status === false) {
    console.error("Paystack request failed:", {
      path,
      status: res.status,
      response: json,
    });

    throw new Error(json.message || `Paystack request to ${path} failed.`);
  }

  if (!json.data) {
    throw new Error(`Paystack did not return data for ${path}.`);
  }

  return json.data;
}

export type PaystackInitializeResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type InitializeTransactionParams = {
  email: string;
  amountKobo: number;
  planCode: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
};

export function initializeTransaction(params: InitializeTransactionParams) {
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

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");

  const actualBuffer = Buffer.from(signatureHeader, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}