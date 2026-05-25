export let env: Record<string, string> = {};

export function setEnv(bindings: any) {
    env = {
        SUPABASE_URL: bindings.SUPABASE_URL || bindings.VITE_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY,
        MERCADOPAGO_ACCESS_TOKEN: bindings.MERCADOPAGO_ACCESS_TOKEN,
        GEMINI_API_KEY: bindings.GEMINI_API_KEY,
        APP_URL: bindings.APP_URL || 'https://voxie.pages.dev',
    };
}
