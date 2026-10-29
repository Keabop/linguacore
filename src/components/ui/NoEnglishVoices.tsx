import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useEnglishVoices } from '../../hooks/useEnglishVoices';

const PLATFORMS = ['windows', 'mac', 'android', 'ios'] as const;

/** Explains how to install an English voice, shown only when the browser has none. */
export default function NoEnglishVoices({ className = '' }: { className?: string }) {
    const { t } = useTranslation();
    const { ready, hasEnglish } = useEnglishVoices();
    if (!ready || hasEnglish) return null;

    return (
        <div role="status" className={`flex gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] px-4 py-3 text-sm text-[var(--color-on-surface)] ${className}`}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
            <div className="space-y-1.5">
                <p className="font-semibold">{t('voices.missingTitle')}</p>
                <p className="text-[var(--color-on-surface-muted)]">{t('voices.missingBody')}</p>
                <ul className="list-disc pl-4 text-[var(--color-on-surface-muted)] space-y-0.5">
                    {PLATFORMS.map(p => <li key={p}>{t(`voices.${p}`)}</li>)}
                </ul>
            </div>
        </div>
    );
}
