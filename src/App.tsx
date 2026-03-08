import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sileo';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import { useAuth } from './lib/AuthContext';
import type { ReactNode } from 'react';

const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StoryList = lazy(() => import('./pages/StoryList'));
const StoryReader = lazy(() => import('./pages/StoryReader'));
const ReviewSession = lazy(() => import('./pages/ReviewSession'));
const Stats = lazy(() => import('./pages/Stats'));
const ConversationTutor = lazy(() => import('./pages/ConversationTutor'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const UnitFlow = lazy(() => import('./pages/UnitFlow'));
const Practice = lazy(() => import('./pages/Practice'));

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
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public route */}
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />

                {/* Protected routes */}
                <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/" element={<SafeRoute><Dashboard /></SafeRoute>} />
                    <Route path="/learn" element={<SafeRoute><StoryList /></SafeRoute>} />
                    <Route path="/learn/:storyId" element={<SafeRoute><StoryReader /></SafeRoute>} />
                    <Route path="/review" element={<SafeRoute><ReviewSession /></SafeRoute>} />
                    <Route path="/stats" element={<SafeRoute><Stats /></SafeRoute>} />
                    <Route path="/chat" element={<SafeRoute><ConversationTutor /></SafeRoute>} />
                    <Route path="/path" element={<SafeRoute><LearningPath /></SafeRoute>} />
                    <Route path="/path/:unitId" element={<SafeRoute><UnitFlow /></SafeRoute>} />
                    <Route path="/practice" element={<SafeRoute><Practice /></SafeRoute>} />
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
