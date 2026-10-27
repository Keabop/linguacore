// @vitest-environment node
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildManifest, parseSignatureHeader, verifyMercadoPagoSignature } from './webhookSignature';

const SECRET = 'test-secret';

/** Signs like Mercado Pago does, with Node's crypto as an independent reference. */
function sign(manifest: string, secret = SECRET) {
    return createHmac('sha256', secret).update(manifest).digest('hex');
}

describe('parseSignatureHeader', () => {
    it('reads ts and v1 in any order and with spaces', () => {
        expect(parseSignatureHeader('v1=abc, ts=123')).toEqual({ ts: '123', v1: 'abc' });
    });

    it('returns nothing for a malformed header', () => {
        expect(parseSignatureHeader('garbage')).toEqual({ ts: undefined, v1: undefined });
    });
});

describe('buildManifest', () => {
    it('follows the id;request-id;ts order', () => {
        expect(buildManifest('123', 'req-1', '999')).toBe('id:123;request-id:req-1;ts:999;');
    });

    it('lower-cases alphanumeric ids', () => {
        expect(buildManifest('AbC123', 'req-1', '999')).toBe('id:abc123;request-id:req-1;ts:999;');
    });

    it('leaves out the pairs that are missing', () => {
        expect(buildManifest(null, null, '999')).toBe('ts:999;');
    });
});

describe('verifyMercadoPagoSignature', () => {
    const ts = '1704908010';
    const valid = sign(`id:2c9380848f;request-id:req-1;ts:${ts};`);

    it('accepts a notification signed with the secret', async () => {
        await expect(verifyMercadoPagoSignature({
            xSignature: `ts=${ts},v1=${valid}`, xRequestId: 'req-1', dataId: '2c9380848f', secret: SECRET,
        })).resolves.toBe(true);
    });

    it('rejects a different data id', async () => {
        await expect(verifyMercadoPagoSignature({
            xSignature: `ts=${ts},v1=${valid}`, xRequestId: 'req-1', dataId: 'other', secret: SECRET,
        })).resolves.toBe(false);
    });

    it('rejects a signature made with another secret', async () => {
        const forged = sign(`id:2c9380848f;request-id:req-1;ts:${ts};`, 'attacker');
        await expect(verifyMercadoPagoSignature({
            xSignature: `ts=${ts},v1=${forged}`, xRequestId: 'req-1', dataId: '2c9380848f', secret: SECRET,
        })).resolves.toBe(false);
    });

    it('rejects a missing header or secret', async () => {
        await expect(verifyMercadoPagoSignature({ xSignature: null, xRequestId: 'req-1', dataId: '1', secret: SECRET })).resolves.toBe(false);
        await expect(verifyMercadoPagoSignature({ xSignature: `ts=${ts},v1=${valid}`, xRequestId: 'req-1', dataId: '1', secret: '' })).resolves.toBe(false);
    });
});
