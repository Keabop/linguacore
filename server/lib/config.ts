// Cloudflare Pages passes variables per request (context.env), so each function
// calls setEnv(context.env) before using anything that reads `env`.

const DEFAULT_APP_URL = 'https://voxie.pages.dev';

export let env: Record<string, string> = {
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    MERCADOPAGO_ACCESS_TOKEN: '',
    MERCADOPAGO_WEBHOOK_SECRET: '',
    GEMINI_API_KEY: '',
    APP_URL: DEFAULT_APP_URL,
    MERCADOPAGO_TEST_PAYER_EMAIL: '',
};

/** Replaces `env` with this request's bindings; nothing carries over from an earlier request. */
export function setEnv(bindings: any) {
    if (!bindings) return;
    env = {
        SUPABASE_URL: bindings.SUPABASE_URL || bindings.VITE_SUPABASE_URL || '',
        SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY || '',
        MERCADOPAGO_ACCESS_TOKEN: bindings.MERCADOPAGO_ACCESS_TOKEN || '',
        MERCADOPAGO_WEBHOOK_SECRET: bindings.MERCADOPAGO_WEBHOOK_SECRET || '',
        GEMINI_API_KEY: bindings.GEMINI_API_KEY || '',
        APP_URL: bindings.APP_URL || DEFAULT_APP_URL,
        MERCADOPAGO_TEST_PAYER_EMAIL: bindings.MERCADOPAGO_TEST_PAYER_EMAIL || '',
    };
}
