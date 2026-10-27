const ALLOWED_ORIGINS = [
    'https://voxie.pages.dev',
    'https://voxie.lat',
    'https://www.voxie.lat',
    'http://localhost:8788', // wrangler pages dev
    'http://localhost:5173',
    'http://localhost:4173',
];

export function getCorsHeaders(
    request: Request,
    methods: string,
    allowHeaders = 'Content-Type, Authorization',
): Record<string, string> {
    const origin = request.headers.get('Origin') ?? '';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': allowHeaders,
        'Content-Type': 'application/json',
    };
}
