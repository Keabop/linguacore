import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import App from './App';
import { AuthProvider } from './lib/AuthContext';
import { createIdbPersister } from './lib/queryPersister';
import './i18n/config';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,          // 5 minutes
            gcTime: 1000 * 60 * 60 * 24,        // 24 hours (keep for offline)
            retry: 1,
            networkMode: 'offlineFirst',
        },
        mutations: {
            networkMode: 'offlineFirst',
        },
    },
});

const persister = createIdbPersister();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                maxAge: 1000 * 60 * 60 * 24 * 7,   // 7 days
            }}
        >
            <AuthProvider>
                <App />
            </AuthProvider>
        </PersistQueryClientProvider>
    </React.StrictMode>,
);
