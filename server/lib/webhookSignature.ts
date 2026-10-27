// Verifies the x-signature header Mercado Pago sends with each webhook. The manifest and
// the HMAC follow https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks

interface SignatureInput {
    xSignature: string | null;
    xRequestId: string | null;
    /** The `data.id` query param of the notification URL. */
    dataId: string | null;
    secret: string;
}

/** Splits `ts=...,v1=...` into its parts. */
export function parseSignatureHeader(header: string): { ts?: string; v1?: string } {
    const parts: Record<string, string> = {};
    for (const part of header.split(',')) {
        const [key, value] = part.split('=', 2).map(s => s?.trim());
        if (key && value) parts[key] = value;
    }
    return { ts: parts.ts, v1: parts.v1 };
}

/** Pairs that are missing from the notification are left out of the manifest, as Mercado Pago does. */
export function buildManifest(dataId: string | null, xRequestId: string | null, ts: string): string {
    // Alphanumeric ids are signed in lower case
    const id = dataId && /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
    return (id ? `id:${id};` : '') + (xRequestId ? `request-id:${xRequestId};` : '') + `ts:${ts};`;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}

/** Compares without stopping at the first different character, so timing reveals nothing. */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function verifyMercadoPagoSignature({ xSignature, xRequestId, dataId, secret }: SignatureInput): Promise<boolean> {
    if (!xSignature || !secret) return false;
    const { ts, v1 } = parseSignatureHeader(xSignature);
    if (!ts || !v1) return false;
    const expected = await hmacSha256Hex(secret, buildManifest(dataId, xRequestId, ts));
    return timingSafeEqual(expected, v1.toLowerCase());
}
