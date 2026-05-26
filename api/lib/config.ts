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
};

export function setEnv(bindings: any) {
    if (!bindings) return;
    env = {
        SUPABASE_URL: bindings.SUPABASE_URL || bindings.VITE_SUPABASE_URL || env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
        MERCADOPAGO_ACCESS_TOKEN: bindings.MERCADOPAGO_ACCESS_TOKEN || env.MERCADOPAGO_ACCESS_TOKEN,
        GEMINI_API_KEY: bindings.GEMINI_API_KEY || env.GEMINI_API_KEY,
        APP_URL: bindings.APP_URL || env.APP_URL || 'https://voxie.pages.dev',
    };
}
