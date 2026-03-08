import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sileo';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const StoryList = lazy(() => import('./pages/StoryList'));
const StoryReader = lazy(() => import('./pages/StoryReader'));
const ReviewSession = lazy(() => import('./pages/ReviewSession'));
const Stats = lazy(() => import('./pages/Stats'));
const ConversationTutor = lazy(() => import('./pages/ConversationTutor'));
const LearningPath = lazy(() => import('./pages/LearningPath'));
const UnitFlow = lazy(() => import('./pages/UnitFlow'));
const Practice = lazy(() => import('./pages/Practice'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                    <Route path="/learn" element={<Suspense fallback={<PageLoader />}><StoryList /></Suspense>} />
                    <Route path="/learn/:storyId" element={<Suspense fallback={<PageLoader />}><StoryReader /></Suspense>} />
                    <Route path="/review" element={<Suspense fallback={<PageLoader />}><ReviewSession /></Suspense>} />
                    <Route path="/stats" element={<Suspense fallback={<PageLoader />}><Stats /></Suspense>} />
                    <Route path="/chat" element={<Suspense fallback={<PageLoader />}><ConversationTutor /></Suspense>} />
                    <Route path="/path" element={<Suspense fallback={<PageLoader />}><LearningPath /></Suspense>} />
                    <Route path="/path/:unitId" element={<Suspense fallback={<PageLoader />}><UnitFlow /></Suspense>} />
                    <Route path="/practice" element={<Suspense fallback={<PageLoader />}><Practice /></Suspense>} />
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
