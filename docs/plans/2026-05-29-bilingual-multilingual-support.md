# Soporte Multilingüe y Bilingüe en Voxie — Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a fully robust language setting supporting Spanish Only, English Only, and Bilingual Combined modes dynamically using `react-i18next` and client-side persistence.

**Architecture:** We will load two main dictionaries: `es.json` (Spanish) and `en.json` (English). A custom React hook and component will dynamically combine keys to render a dual-language (English main, Spanish small subtext) interface in "Bilingual" mode, ensuring 100% DRY translation management.

**Tech Stack:** React, TypeScript, Vite, TailwindCSS (v4), react-i18next

---

### Task 1: Crear el Diccionario en Inglés (en.json)

**Files:**
- Create: `src/i18n/en.json`

**Step 1: Write the dictionary content**
Create the English JSON translations dictionary:

```json
{
  "nav": {
    "home": "Home",
    "learn": "Learn",
    "chat": "AI Tutor",
    "review": "Review",
    "stats": "Stats",
    "path": "Learning Path",
    "practice": "Practice",
    "profile": "Profile"
  },
  "dashboard": {
    "greeting": "Hello!",
    "motivation": "Keep learning English every day",
    "welcome": "Welcome to Voxie!",
    "dueToday": "For review today",
    "cards": "cards",
    "pendingReview": "pending review",
    "noCards": "You have no pending cards!",
    "recommended": "Recommended stories",
    "viewAll": "View all",
    "continueReading": "Continue reading",
    "startReview": "Start review",
    "yourProgress": "Your progress",
    "wordsLearned": "Words learned",
    "storiesRead": "Stories read",
    "totalCards": "Cards in deck",
    "streak": "Streak",
    "days": "days",
    "continueLearning": "Continue learning",
    "unitProgress": "Unit {{current}} of {{total}} — {{level}}",
    "allCompleted": "You have completed all units of this level!",
    "goToPath": "Go to path",
    "continue": "Continue",
    "grammarSkills": "Grammar skills",
    "grammarDue": "grammar due",
    "myErrors": "My errors",
    "errorsDue": "errors due",
    "greetingDueCards": "You have {{count}} cards to review",
    "greetingStreak": "You are on a {{count}} day streak",
    "greetingInactive": "It has been {{count}} days since your last session",
    "greetingAllDone": "Everything caught up — nothing pending"
  },
  "reader": {
    "tapToTranslate": "Tap a word to see its translation",
    "addToDeck": "Add to my deck",
    "alreadyAdded": "Already in deck",
    "alreadyKnown": "Already known",
    "translation": "Translation",
    "example": "Example",
    "pronunciation": "Pronunciation",
    "storyCompleted": "Story completed!",
    "wordsAdded": "words added",
    "backToStories": "Back to stories",
    "level": "Level",
    "minutes": "min",
    "words": "words",
    "readStory": "Read story",
    "locked": "Locked",
    "unlockMessage": "Complete level {{level}} to unlock",
    "keyVocabulary": "Key vocabulary",
    "inDeck": "In your deck",
    "known": "Known"
  },
  "storyList": {
    "subtitle": "Explore stories by level",
    "locked": "Locked",
    "read": "Read",
    "generateAI": "Generate with AI",
    "aiTitle": "Generate AI Story",
    "aiDescription": "AI will create a custom story for your level {{level}}. Optionally type a topic.",
    "aiTopicPlaceholder": "Topic (optional): travel, food, sports...",
    "aiGenerating": "Generating story...",
    "aiGenerate": "Generate story"
  },
  "review": {
    "again": "Again",
    "hard": "Hard",
    "good": "Good",
    "easy": "Easy",
    "cardsRemaining": "{{count}} cards remaining",
    "sessionComplete": "Session completed!",
    "sessionDone": "Session completed!",
    "reviewed": "Reviewed",
    "accuracy": "Accuracy",
    "cardsToday": "cards today",
    "noCardsTitle": "All caught up!",
    "noCardsMessage": "You have no cards to review right now. Read more stories to add new words.",
    "allDone": "All caught up!",
    "comeBack": "You have no pending cards. Read more stories to add vocabulary.",
    "backHome": "Back home",
    "showAnswer": "Show answer",
    "context": "Context",
    "nextCard": "Next card",
    "chooseMode": "Choose your review mode",
    "clozeMode": "Complete sentence",
    "clozeDescription": "Fill in the missing word in the sentence",
    "translationMode": "Translation",
    "translationDescription": "Type the translation in Spanish",
    "fillBlank": "Type the word...",
    "writeTranslation": "Type the translation in Spanish...",
    "check": "Verify",
    "correct": "Correct!",
    "incorrect": "Incorrect",
    "correctAnswer": "Correct answer",
    "continueNext": "Continue",
    "changeMode": "Change mode",
    "hint": "Hint",
    "dueCards": "cards due",
    "chooseType": "What do you want to review?",
    "vocabulary": "Vocabulary",
    "grammar": "Grammar",
    "wordsDue": "words due",
    "skillsDue": "skills due",
    "howWasIt": "How well did you know it?",
    "againDesc": "Forgot it",
    "hardDesc": "Hard",
    "goodDesc": "Knew it",
    "easyDesc": "Very easy",
    "grammarTip": "Grammar tip",
    "startExercises": "Start exercises",
    "typeAnswer": "Type your answer...",
    "pressEnter": "Press Enter to submit",
    "finish": "Finish",
    "next": "Next",
    "remaining": "remaining",
    "myErrors": "My errors",
    "errorsDue": "errors due"
  },
  "progress": {
    "title": "Your progress",
    "wordsLearned": "Words learned",
    "currentLevel": "Current level",
    "nextLevel": "Next level",
    "knownPercentage": "You know {{percent}}% of {{level}} vocabulary",
    "moreWords": "{{count}} more words",
    "retention": "Retention",
    "storiesCompleted": "Stories completed",
    "criteria": "Criteria for {{level}}",
    "unitsCompleted": "Units completed",
    "nextUnit": "Next unit"
  },
  "levelUp": {
    "congratulations": "Congratulations!",
    "unlocked": "You unlocked level {{level}}!",
    "message": "You have demonstrated sufficient mastery to advance. New stories and vocabulary await you.",
    "continue": "Continue!",
    "newStoriesAvailable": "new stories available"
  },
  "stats": {
    "title": "Statistics",
    "subtitle": "Your learning progress",
    "totalCards": "Cards in deck",
    "totalReviews": "Total reviews",
    "avgRetention": "Average retention",
    "activity": "Activity (last 35 days)",
    "activities": "activities",
    "lessActive": "Less",
    "moreActive": "More",
    "vocabulary": "Vocabulary",
    "inDeck": "In deck",
    "knownWords": "Already known",
    "total": "Total",
    "levelProgress": "Level progress",
    "unlocked": "Unlocked",
    "locked": "Locked",
    "wordsRequired": "Words required",
    "storiesRequired": "Stories required",
    "thisWeek": "This week",
    "thisMonth": "This month",
    "allTime": "All time",
    "reviewHistory": "Review history",
    "vocabularyBreakdown": "Vocabulary breakdown",
    "learningStreak": "Learning streak",
    "averageRetention": "Average retention",
    "bestStreak": "Best streak",
    "wordsPerLevel": "Words per level",
    "noDataYet": "No data yet. Start learning!"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry",
    "close": "Close",
    "cancel": "Cancel",
    "save": "Save",
    "back": "Back",
    "next": "Next",
    "offline": "No internet connection. AI features are not available.",
    "offlineDisabled": "Not available offline",
    "dataNotFound": "Data not found",
    "dataCorrupt": "Browser data may have been cleared.",
    "resetData": "Reset data"
  },
  "chat": {
    "title": "Conversation Tutor",
    "level": "Level {{level}}",
    "placeholder": "Type in English...",
    "corrections": "Corrections",
    "startConversation": "Start conversation",
    "endSession": "End session",
    "endSessionConfirm": "Are you sure you want to end the conversation?",
    "sessionSaved": "Conversation saved to your history",
    "history": "History",
    "noHistory": "No saved conversations yet",
    "viewSession": "View conversation",
    "sessionDate": "Session on {{date}}",
    "messagesCount": "{{count}} messages",
    "readOnly": "Read only"
  },
  "path": {
    "title": "Learning Path",
    "unit": "Unit",
    "locked": "Locked",
    "current": "In progress",
    "completed": "Completed",
    "assessment": "Level Assessment",
    "startUnit": "Start unit",
    "continueUnit": "Continue",
    "comingSoon": "This page is being built. Soon you will see your learning path!",
    "bannerTitle": "Keep it up, {{name}}!",
    "bannerSubtitle": "Complete the final Checkpoint this week to keep moving forward on your learning path."
  },
  "grammar": {
    "understood": "Understood",
    "title": "Grammar"
  },
  "unitFlow": {
    "skillsAdded": "Grammar skills added!",
    "skillsAddedDesc": "{{count}} skills added to your review",
    "canSpeakNow": "I can speak now"
  },
  "exercises": {
    "title": "Exercises",
    "progress": "{{current}} of {{total}}",
    "correct": "Correct!",
    "incorrect": "Incorrect",
    "score": "Score: {{score}}%",
    "checkAnswer": "Verify",
    "next": "Next",
    "finish": "Finish"
  },
  "practice": {
    "saveToHistory": "Save to history",
    "savedToHistory": "Saved to history!",
    "writingHistory": "Writing history",
    "noWritingHistory": "No writing assessments saved yet",
    "score": "Score: {{score}}%",
    "viewFeedback": "View feedback"
  },
  "assessment": {
    "title": "Assessment {{level}}",
    "pass": "Congratulations! You passed",
    "fail": "You did not reach 80%. Review and try again.",
    "retry": "Retry",
    "score": "Your score: {{score}}%"
  },
  "account": {
    "title": "My Account",
    "plan": "Plan",
    "planFree": "Free",
    "planPro": "Pro",
    "planMonthly": "Monthly",
    "planAnnual": "Annual",
    "memberSince": "Member since",
    "nextBilling": "Next billing",
    "cancelSubscription": "Cancel subscription",
    "reactivateSubscription": "Reactivate subscription",
    "upgradeToPro": "Upgrade to Pro",
    "cancelConfirmTitle": "Are you sure you want to cancel?",
    "cancelConfirmLose": "You will lose access to:",
    "cancelLoseLevel": "A2, B1, and B2 levels",
    "cancelLoseTutor": "Unlimited AI Tutor",
    "cancelLoseWriting": "Unlimited writing practice",
    "cancelLoseStories": "Story generation",
    "cancelAccessUntil": "Your Pro access continues until {{date}}",
    "cancelKeep": "Keep Pro",
    "cancelConfirm": "Yes, cancel",
    "cancelSuccess": "Subscription cancelled. Your Pro access continues until the end of the period.",
    "cancelError": "Error cancelling. Try again.",
    "reactivateSuccess": "Subscription reactivated!",
    "reactivateError": "Error reactivating. Try again.",
    "proStats": "Advanced statistics available with Pro Plan"
  },
  "settings": {
    "title": "Settings",
    "theme": "Theme",
    "themeLight": "Light",
    "themeDark": "Dark",
    "language": "Language",
    "planAndSubscription": "Plan and subscription",
    "logout": "Log out"
  }
}
```

**Step 2: Commit**
```bash
git add src/i18n/en.json
git commit -m "feat(i18n): add English translation dictionary en.json"
```

---

### Task 2: Registrar en.json en la configuración de react-i18next

**Files:**
- Modify: `src/i18n/config.ts`

**Step 1: Write code update**
Modify the i18n initialization file to register the `en` resource and configure default language hooks based on local storage persistence:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';

const savedLang = localStorage.getItem('voxie-display-language') || 'es';
// In bilingual mode, standard i18next uses 'en' as primary language
const activeLang = savedLang === 'bilingual' ? 'en' : savedLang;

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es },
        en: { translation: en },
    },
    lng: activeLang,
    fallbackLng: 'es',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
```

**Step 2: Verify compilation**
Run `npm run build` to make sure there are no import errors.

**Step 3: Commit**
```bash
git add src/i18n/config.ts
git commit -m "feat(i18n): register en.json dictionary and initialize language dynamically from localStorage"
```

---

### Task 3: Crear el Hook useBilingual y el Componente Reusable <Bilingual>

**Files:**
- Create: `src/hooks/useBilingual.ts`
- Create: `src/components/ui/Bilingual.tsx`

**Step 1: Create hook file `src/hooks/useBilingual.ts`**
Create a react hook to resolve bilingual values dynamically:

```typescript
import { useTranslation } from 'react-i18next';

export function useBilingual() {
    const { t, i18n } = useTranslation();
    const currentMode = localStorage.getItem('voxie-display-language') || 'es';

    const bt = (key: string, options?: any) => {
        if (currentMode === 'bilingual') {
            const primary = i18n.t(key, { ...options, lng: 'en' });
            const secondary = i18n.t(key, { ...options, lng: 'es' });
            return { primary, secondary, isBilingual: true };
        } else if (currentMode === 'en') {
            return { primary: i18n.t(key, { ...options, lng: 'en' }), secondary: '', isBilingual: false };
        } else {
            return { primary: i18n.t(key, { ...options, lng: 'es' }), secondary: '', isBilingual: false };
        }
    };

    return { bt, t, mode: currentMode };
}
```

**Step 2: Create UI component `src/components/ui/Bilingual.tsx`**
Create a component that renders the primary language with the secondary small subtitle dynamically on the DOM:

```typescript
import { useBilingual } from '../../hooks/useBilingual';

interface BilingualProps {
    textKey: string;
    options?: any;
    className?: string;
    subClassName?: string;
}

export default function Bilingual({ textKey, options, className, subClassName }: BilingualProps) {
    const { bt } = useBilingual();
    const { primary, secondary, isBilingual } = bt(textKey, options);

    if (isBilingual) {
        return (
            <span className="flex flex-col text-left leading-tight py-0.5">
                <span className={className}>{primary}</span>
                <span className={`text-[10px] text-[var(--color-on-surface-muted)]/75 font-semibold mt-0.5 tracking-wide lowercase first-letter:uppercase ${subClassName}`}>
                    {secondary}
                </span>
            </span>
        );
    }

    return <span className={className}>{primary}</span>;
}
```

**Step 3: Commit**
```bash
git add src/hooks/useBilingual.ts src/components/ui/Bilingual.tsx
git commit -m "feat(i18n): implement useBilingual hook and Bilingual text rendering component"
```

---

### Task 4: Crear el Selector de Idioma en SettingsModal

**Files:**
- Modify: `src/components/SettingsModal.tsx`

**Step 1: Write code update**
Modify the SettingsModal component to support dynamic selection and instant language reload:

```typescript
// Replace lines 110-119 in SettingsModal.tsx with this:
```

```typescript
import { useBilingual } from '../hooks/useBilingual';
// ... inside SettingsModal component:
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(
        localStorage.getItem('voxie-display-language') || 'es'
    );

    const handleLangChange = (lang: string) => {
        localStorage.setItem('voxie-display-language', lang);
        setCurrentLang(lang);
        if (lang === 'bilingual') {
            i18n.changeLanguage('en');
        } else {
            i18n.changeLanguage(lang);
        }
        // Force state reload by dispatching custom event or simple window reload to re-instantiate hooks
        window.dispatchEvent(new Event('voxie-language-changed'));
    };

    // Under Theme container JSX block, replace the Language JSX block with this:
    {/* Language */}
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--color-on-surface-muted)]" />
            <span className="text-sm font-medium text-[var(--color-on-surface)]">{t('settings.language')}</span>
        </div>
        <select
            value={currentLang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="text-xs text-[var(--color-on-surface)] font-bold px-3 py-1.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-outline-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
        >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="bilingual">Bilingüe (EN + ES)</option>
        </select>
    </div>
```

**Step 2: Add event listener in hook**
Update `src/hooks/useBilingual.ts` to listen to `'voxie-language-changed'` event to trigger a react re-render instantly when the setting is changed:

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useBilingual() {
    const { t, i18n } = useTranslation();
    const [mode, setMode] = useState(localStorage.getItem('voxie-display-language') || 'es');

    useEffect(() => {
        const handleLangChange = () => {
            setMode(localStorage.getItem('voxie-display-language') || 'es');
        };
        window.addEventListener('voxie-language-changed', handleLangChange);
        return () => window.removeEventListener('voxie-language-changed', handleLangChange);
    }, []);

    const bt = (key: string, options?: any) => {
        if (mode === 'bilingual') {
            const primary = i18n.t(key, { ...options, lng: 'en' });
            const secondary = i18n.t(key, { ...options, lng: 'es' });
            return { primary, secondary, isBilingual: true };
        } else if (mode === 'en') {
            return { primary: i18n.t(key, { ...options, lng: 'en' }), secondary: '', isBilingual: false };
        } else {
            return { primary: i18n.t(key, { ...options, lng: 'es' }), secondary: '', isBilingual: false };
        }
    };

    return { bt, t, mode };
}
```

**Step 3: Commit**
```bash
git add src/hooks/useBilingual.ts src/components/SettingsModal.tsx
git commit -m "feat(settings): integrate interactive language dropdown selector and event listener in SettingsModal"
```

---

### Task 5: Adaptar el Menú Lateral de la Barra (Layout.tsx)

**Files:**
- Modify: `src/components/Layout.tsx`

**Step 1: Write code update**
Replace NavLink labels and titles inside `src/components/Layout.tsx` with `<Bilingual>` component:

```typescript
// Import the Bilingual component at the top of Layout.tsx:
import Bilingual from './ui/Bilingual';

// Update RailNavItem link text inside Layout.tsx (around lines 56-65):
<AnimatePresence>
    {expanded && (
        <Bilingual 
            textKey={labelKey} 
            className="text-sm font-semibold whitespace-nowrap text-[var(--color-on-surface)]" 
            subClassName="text-[9px] -mt-0.5 opacity-80"
        />
    )}
</AnimatePresence>

// Update bottom profile email split label split (around lines 183-185):
<p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
    {authUser.user_metadata?.full_name || authUser.email?.split('@')[0]}
</p>
<div className="flex items-center gap-1.5 mt-0.5">
    <Bilingual textKey="progress.currentLevel" className="text-[10px] font-bold text-[var(--color-on-surface-muted)]" />
    <LevelBadge level={progressInfo.currentLevel} size="compact" />
</div>
```

**Step 2: Run verification and tests**
1. Run `npm run build` to confirm production build is completely clean.
2. Run `npm run test:run` to confirm all tests pass successfully.

**Step 3: Commit**
```bash
git add src/components/Layout.tsx
git commit -m "style(layout): integrate Bilingual component labels in sidebar items"
```
