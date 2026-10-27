// Polyfill global 'process' for third-party library compatibility in Edge Runtimes (like Cloudflare Pages)
if (typeof (globalThis as any).process === 'undefined') {
    (globalThis as any).process = {
        env: {},
        version: 'v18.0.0',
        versions: { node: '18.0.0' },
        nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
    };
}

// Polyfill global 'fetch' to inject headers.raw() for compatibility with Node-fetch dependent libraries
const originalFetch = globalThis.fetch;
if (originalFetch) {
    globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const response = await originalFetch(input, init);
        if (response.headers && typeof (response.headers as any).raw !== 'function') {
            (response.headers as any).raw = function () {
                const rawHeaders: Record<string, string[]> = {};
                response.headers.forEach((value, key) => {
                    rawHeaders[key] = [value];
                });
                return rawHeaders;
            };
        }
        return response;
    };
}

// Helper to safely access process.env in runtimes where 'process' is not defined (like Cloudflare Edge)
function safeGetEnv(key: string): string | undefined {
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
}

export let env: Record<string, string> = {
    SUPABASE_URL: safeGetEnv('SUPABASE_URL') || safeGetEnv('VITE_SUPABASE_URL') || '',
    SUPABASE_SERVICE_ROLE_KEY: safeGetEnv('SUPABASE_SERVICE_ROLE_KEY') || '',
    MERCADOPAGO_ACCESS_TOKEN: safeGetEnv('MERCADOPAGO_ACCESS_TOKEN') || '',
    GEMINI_API_KEY: safeGetEnv('GEMINI_API_KEY') || '',
    APP_URL: safeGetEnv('APP_URL') || 'https://voxie.pages.dev',
    MERCADOPAGO_TEST_PAYER_EMAIL: safeGetEnv('MERCADOPAGO_TEST_PAYER_EMAIL') || '',
};

export function setEnv(bindings: any) {
    if (!bindings) return;
    env = {
        SUPABASE_URL: bindings.SUPABASE_URL || bindings.VITE_SUPABASE_URL || env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
        MERCADOPAGO_ACCESS_TOKEN: bindings.MERCADOPAGO_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN,
        GEMINI_API_KEY: bindings.GEMINI_API_KEY || env.GEMINI_API_KEY,
        APP_URL: bindings.APP_URL || env.APP_URL || 'https://voxie.pages.dev',
        MERCADOPAGO_TEST_PAYER_EMAIL: bindings.MERCADOPAGO_TEST_PAYER_EMAIL || env.MERCADOPAGO_TEST_PAYER_EMAIL || '',
    };
}
