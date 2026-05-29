import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sileo';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import { useAuth } from './lib/AuthContext';
import type { ReactNode, ComponentType } from 'react';
import Dashboard from './pages/Dashboard';
import StoryList from './pages/StoryList';
import ReviewSession from './pages/ReviewSession';
import Account from './pages/Account';
import ConversationTutor from './pages/ConversationTutor';
import Practice from './pages/Practice';

/**
 * Lazy import with retry — handles transient network failures and
 * service-worker cache race conditions. On final failure it rejects
 * so the ErrorBoundary can show an offline-specific message.
 */
function lazyRetry<T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    retries = 2,
): React.LazyExoticComponent<T> {
    return lazy(() => {
        const attempt = (remaining: number): Promise<{ default: T }> =>
            factory().catch((err) => {
                if (remaining <= 0) throw err;
                return new Promise<{ default: T }>((resolve) =>
                    setTimeout(() => resolve(attempt(remaining - 1)), 1000),
                );
            });
        return attempt(retries);
    });
}

const Landing = lazyRetry(() => import('./pages/Landing'));
const Auth = lazyRetry(() => import('./pages/Auth'));
const StoryReader = lazyRetry(() => import('./pages/StoryReader'));
const LearningPath = lazyRetry(() => import('./pages/LearningPath'));
const UnitFlow = lazyRetry(() => import('./pages/UnitFlow'));
const Pricing = lazyRetry(() => import('./pages/Pricing'));

function SafeRoute({ children }: { children: ReactNode }) {
    const location = useLocation();
    return (
        <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
}

function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/" replace />;
    return <>{children}</>;
}

/** Show Landing for guests, redirect authenticated users to /dashboard */
function SmartHome() {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <Suspense fallback={<PageLoader />}><Landing /></Suspense>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<SmartHome />} />
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />

                {/* Protected routes */}
                <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/learn" element={<StoryList />} />
                    <Route path="/learn/:storyId" element={<SafeRoute><StoryReader /></SafeRoute>} />
                    <Route path="/review" element={<ReviewSession />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/chat" element={<ConversationTutor />} />
                    <Route path="/path" element={<SafeRoute><LearningPath /></SafeRoute>} />
                    <Route path="/path/:unitId" element={<SafeRoute><UnitFlow /></SafeRoute>} />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/pricing" element={<SafeRoute><Pricing /></SafeRoute>} />
                </Route>
            </Routes>
            <Toaster
                position="top-right"
                options={{
                    fill: '#1a1a1a',
                    styles: {
                        title: 'text-white!',
                        description: 'text-white/70!',
                        badge: 'bg-white/10!',
                    },
                }}
            />
        </BrowserRouter>
    );
}
