import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader, { afterSproutGrows } from './components/PageLoader';
import { useAuth } from './lib/AuthContext';
import { useAdmin } from './hooks/useAdmin';
import type { ReactNode, ComponentType } from 'react';
import TrialShell from './components/TrialShell';
import GuestImporter from './components/GuestImporter';
import LegalConsent from './components/LegalConsent';
import { TRIAL_STORY_ID } from './lib/guestTrial';
import UpdatePrompt from './components/UpdatePrompt';

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
        // The page waits for the loader's sprout to finish growing, so it never shows half a plant
        return Promise.all([attempt(retries), afterSproutGrows()]).then(([module]) => module);
    });
}

const Landing = lazyRetry(() => import('./pages/Landing'));
const Dashboard = lazyRetry(() => import('./pages/Dashboard'));
const GardenPath = lazyRetry(() => import('./pages/GardenPath'));
const FirstSteps = lazyRetry(() => import('./pages/FirstSteps'));
const StoryList = lazyRetry(() => import('./pages/StoryList'));
const ReviewSession = lazyRetry(() => import('./pages/ReviewSession'));
const Account = lazyRetry(() => import('./pages/Account'));
const ConversationTutor = lazyRetry(() => import('./pages/ConversationTutor'));
const Practice = lazyRetry(() => import('./pages/Practice'));
const Auth = lazyRetry(() => import('./pages/Auth'));
const StoryReader = lazyRetry(() => import('./pages/StoryReader'));
const UnitFlow = lazyRetry(() => import('./pages/UnitFlow'));
const Pricing = lazyRetry(() => import('./pages/Pricing'));
const ErrorLab = lazyRetry(() => import('./pages/ErrorLab'));
const CEFRSimulator = lazyRetry(() => import('./pages/CEFRSimulator'));
const AdminDashboard = lazyRetry(() => import('./pages/AdminDashboard'));
const Credits = lazyRetry(() => import('./pages/Credits'));
const Legal = lazyRetry(() => import('./pages/Legal'));

function SafeRoute({ children }: { children: ReactNode }) {
    const location = useLocation();
    return (
        <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageLoader />}>
                <div className="page-enter">{children}</div>
            </Suspense>
        </ErrorBoundary>
    );
}

function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    // Signed out (or the session ended): straight to the sign-in, not the landing
    if (!user) return <Navigate to="/auth" replace />;
    return <LegalConsent>{children}</LegalConsent>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
    const { loading } = useAuth();
    const { isAdmin } = useAdmin();
    if (loading) return <PageLoader />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

/** A trial page for visitors; a signed-in learner gets the same page inside the app. */
function TrialRoute({ inApp, children }: { inApp: string; children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (user) return <Navigate to={inApp} replace />;
    return <TrialShell><SafeRoute>{children}</SafeRoute></TrialShell>;
}

/** Show Landing for guests, redirect authenticated users to /dashboard */
function SmartHome() {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <Suspense fallback={<PageLoader />}><div className="page-enter"><Landing /></div></Suspense>;
}

export default function App() {
    return (
        <BrowserRouter>
            <GuestImporter />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<SmartHome />} />
                {/* The landing, also for a signed-in learner who wants to see it */}
                <Route path="/landing" element={<Suspense fallback={<PageLoader />}><div className="page-enter"><Landing /></div></Suspense>} />
                <Route path="/auth" element={<Suspense fallback={<PageLoader />}><div className="page-enter"><Auth /></div></Suspense>} />
                <Route path="/credits" element={<SafeRoute><Credits /></SafeRoute>} />
                <Route path="/privacidad" element={<SafeRoute><Legal doc="privacidad" /></SafeRoute>} />
                <Route path="/terminos" element={<SafeRoute><Legal doc="terminos" /></SafeRoute>} />
                <Route path="/cookies" element={<SafeRoute><Legal doc="cookies" /></SafeRoute>} />
                <Route path="/probar" element={<TrialRoute inApp={`/learn/${TRIAL_STORY_ID}`}><StoryReader trialStoryId={TRIAL_STORY_ID} /></TrialRoute>} />
                <Route path="/probar/nivel" element={<TrialRoute inApp="/review/simulator"><CEFRSimulator guest /></TrialRoute>} />

                {/* Protected routes */}
                <Route element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/learn" element={<StoryList />} />
                    <Route path="/learn/:storyId" element={<SafeRoute><StoryReader /></SafeRoute>} />
                    <Route path="/review" element={<ReviewSession />} />
                    <Route path="/review/lab" element={<SafeRoute><ErrorLab /></SafeRoute>} />
                    <Route path="/review/simulator" element={<SafeRoute><CEFRSimulator /></SafeRoute>} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/chat" element={<ConversationTutor />} />
                    <Route path="/path" element={<SafeRoute><GardenPath /></SafeRoute>} />
                    <Route path="/path/:unitId" element={<SafeRoute><UnitFlow /></SafeRoute>} />
                    <Route path="/primeros-pasos" element={<SafeRoute><FirstSteps /></SafeRoute>} />
                    <Route path="/practice" element={<Practice />} />
                    <Route path="/pricing" element={<SafeRoute><Pricing /></SafeRoute>} />
                    <Route path="/admin" element={<SafeRoute><RequireAdmin><AdminDashboard /></RequireAdmin></SafeRoute>} />
                </Route>
            </Routes>
            <UpdatePrompt />
        </BrowserRouter>
    );
}
