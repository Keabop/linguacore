import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { LEGAL_VERSION } from '../data/legalOwner';
import Wordmark from './ui/Wordmark';

const legalLink = 'font-semibold text-[var(--color-primary)] underline underline-offset-2';

/**
 * The box that accepts the terms, the privacy notice and the age. Its links open in a new tab,
 * so reading them doesn't lose what was typed in the form.
 */
export function LegalCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-start gap-3 text-xs leading-relaxed text-[var(--color-on-surface-muted)] font-body cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
                <Trans
                    i18nKey="legal.consent"
                    components={{
                        terms: <Link to="/terminos" target="_blank" rel="noreferrer" className={legalLink} />,
                        privacy: <Link to="/privacidad" target="_blank" rel="noreferrer" className={legalLink} />,
                    }}
                />
            </span>
        </label>
    );
}

/**
 * Accounts that never accepted the current terms (made with Google, or before they existed)
 * accept them here before using the app. The account keeps which version it accepted.
 */
export default function LegalConsent({ children }: { children: ReactNode }) {
    const { user, signOut } = useAuth();
    const { t } = useTranslation();
    const [checked, setChecked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);

    if (!user || user.user_metadata?.accepted_legal === LEGAL_VERSION) return <>{children}</>;

    const accept = async () => {
        setSaving(true);
        setFailed(false);
        // The auth listener receives the updated user and this screen gives way to the app
        const { error } = await supabase.auth.updateUser({ data: { accepted_legal: LEGAL_VERSION } });
        if (error) setFailed(true);
        setSaving(false);
    };

    return (
        <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-5 py-10">
            <div className="w-full max-w-md widget space-y-5">
                <Wordmark className="text-2xl" />
                <div className="space-y-2">
                    <h1 className="text-xl font-bold">{t('legal.consentTitle')}</h1>
                    <p className="text-sm leading-relaxed text-[var(--color-on-surface-muted)]">{t('legal.consentBody')}</p>
                </div>
                <LegalCheckbox checked={checked} onChange={setChecked} />
                {failed && <p className="text-xs text-[var(--color-error)]">{t('legal.consentError')}</p>}
                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                    <button
                        onClick={accept}
                        disabled={!checked || saving}
                        className="btn-primary flex-1 px-5 py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t('legal.consentAccept')}
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="flex-1 px-5 py-3 text-sm rounded-full text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors"
                    >
                        {t('legal.consentDecline')}
                    </button>
                </div>
            </div>
        </main>
    );
}
