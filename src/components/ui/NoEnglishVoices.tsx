import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, X } from 'lucide-react';
import { useEnglishVoices } from '../../hooks/useEnglishVoices';

const PLATFORMS = ['windows', 'mac', 'android', 'ios'] as const;

/**
 * Explains how to install an English voice, shown only when the browser has none, or that this
 * browser can't read aloud. The learner can close it, so it never keeps covering the page.
 */
export default function NoEnglishVoices({ className = '' }: { className?: string }) {
    const { t } = useTranslation();
    const { ready, hasEnglish, supported } = useEnglishVoices();
    const [closed, setClosed] = useState(false);
    if (!ready || hasEnglish || closed) return null;

    return (
        <div role="status" className={`flex gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] px-4 py-3 text-sm text-[var(--color-on-surface)] ${className}`}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
            <div className="flex-1 space-y-1.5">
                <p className="font-semibold">{t(supported ? 'voices.missingTitle' : 'voices.unsupportedTitle')}</p>
                <p className="text-[var(--color-on-surface-muted)]">{t(supported ? 'voices.missingBody' : 'voices.unsupportedBody')}</p>
                {supported && (
                    <ul className="list-disc pl-4 text-[var(--color-on-surface-muted)] space-y-0.5">
                        {PLATFORMS.map(p => <li key={p}>{t(`voices.${p}`)}</li>)}
                    </ul>
                )}
            </div>
            <button
                type="button"
                onClick={() => setClosed(true)}
                aria-label={t('common.close')}
                className="-m-1 h-8 w-8 shrink-0 grid place-items-center rounded-full text-[var(--color-on-surface-muted)] hover:bg-[var(--color-warning)]/15 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
            >
                <X className="w-4 h-4" aria-hidden="true" />
            </button>
        </div>
    );
}
