import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,json,svg,png,ico}'],
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\/assets\/.*\.js$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'js-chunks-cache',
                            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: /\/api\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
                            cacheableResponse: { statuses: [0, 200] },
                            networkTimeoutSeconds: 10,
                        },
                    },
                ],
            },
            manifest: {
                name: 'LinguaCore - Aprende Inglés',
                short_name: 'LinguaCore',
                description: 'Aprende inglés con historias interactivas y repetición espaciada',
                lang: 'es',
                theme_color: '#6366f1',
                background_color: '#0f0f23',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                icons: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' as any },
                ],
            },
        }),
    ],
    build: {
        target: 'es2020',
        cssMinify: 'lightningcss',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    // Normalise separators for reliable matching
                    const n = id.replace(/\\/g, '/');

                    // Core React runtime + router (includes scheduler,
                    // use-sync-external-store, and other React internals)
                    if (
                        /\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|use-sync-external-store)\//.test(n)
                    ) {
                        return 'vendor-react';
                    }
                    // Animation
                    if (n.includes('/framer-motion/')) return 'vendor-motion';
                    // Persistence & server-state
                    if (n.includes('/dexie/') || n.includes('/dexie-react-hooks/') ||
                        n.includes('/@tanstack/react-query/') ||
                        n.includes('/@tanstack/react-query-persist-client/') ||
                        n.includes('/idb-keyval/')) {
                        return 'vendor-data';
                    }
                    // i18n
                    if (n.includes('/i18next/') || n.includes('/react-i18next/')) {
                        return 'vendor-i18n';
                    }
                    // Icons
                    if (n.includes('/lucide-react/')) return 'vendor-icons';
                    // HTML sanitiser -- only used by StoryReader (lazy)
                    if (n.includes('/dompurify/')) return 'vendor-dompurify';
                },
            },
        },
    },
});
