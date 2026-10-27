// Cloudflare Pages passes variables per request (context.env), so each function
// calls setEnv(context.env) before using anything that reads `env`.

const DEFAULT_APP_URL = 'https://voxie.pages.dev';

export let env: Record<string, string> = {
    SUPABASE_URL: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    MERCADOPAGO_ACCESS_TOKEN: '',
    GEMINI_API_KEY: '',
    APP_URL: DEFAULT_APP_URL,
    MERCADOPAGO_TEST_PAYER_EMAIL: '',
};

export function setEnv(bindings: any) {
    if (!bindings) return;
    env = {
        SUPABASE_URL: bindings.SUPABASE_URL || bindings.VITE_SUPABASE_URL || env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
        MERCADOPAGO_ACCESS_TOKEN: bindings.MERCADOPAGO_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN,
        GEMINI_API_KEY: bindings.GEMINI_API_KEY || env.GEMINI_API_KEY,
        APP_URL: bindings.APP_URL || env.APP_URL || DEFAULT_APP_URL,
        MERCADOPAGO_TEST_PAYER_EMAIL: bindings.MERCADOPAGO_TEST_PAYER_EMAIL || env.MERCADOPAGO_TEST_PAYER_EMAIL || '',
    };
}
