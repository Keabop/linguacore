import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/ui/BackButton';
// CMUdict's BSD license asks for its notice in the app's documentation once its data ships
import cmudictLicense from '../../content/reference/CMUDICT-LICENSE?raw';

/** Sources of the teaching content and the notices their licenses ask for. */
export default function Credits() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="py-6 px-4 max-w-3xl mx-auto space-y-6">
            {/* Reached from the settings or the landing page; opened by its link, it goes home */}
            <BackButton label={t('common.back')} onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} />

            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">{t('credits.title')}</h1>
                <p className="text-sm text-[var(--color-on-surface-muted)]">{t('credits.intro')}</p>
            </div>

            <section className="widget space-y-3">
                <h2 className="text-lg font-bold">{t('credits.cefrjTitle')}</h2>
                <p className="text-sm leading-relaxed text-[var(--color-on-surface-muted)]">{t('credits.cefrjBody')}</p>
                <p className="text-sm leading-relaxed">
                    The CEFR-J Wordlist Version 1.5. Compiled by Yukio Tono, Tokyo University of Foreign Studies.
                    Retrieved from{' '}
                    <a href="http://www.cefr-j.org/download.html" target="_blank" rel="noreferrer" className="font-semibold text-[var(--color-primary)] underline underline-offset-2">
                        http://www.cefr-j.org/download.html<span className="sr-only"> ({t('credits.newTab')})</span>
                    </a>{' '}
                    (via https://github.com/openlanguageprofiles/olp-en-cefrj) on 27/10/2026.
                </p>
            </section>

            <section className="widget space-y-3">
                <h2 className="text-lg font-bold">{t('credits.cmudictTitle')}</h2>
                <p className="text-sm leading-relaxed text-[var(--color-on-surface-muted)]">{t('credits.cmudictBody')}</p>
                <pre className="whitespace-pre-wrap break-words rounded-[var(--radius-sm)] bg-[var(--color-surface-container)] p-4 text-xs leading-relaxed font-mono text-[var(--color-on-surface)]">
                    {cmudictLicense.trim()}
                </pre>
            </section>
        </div>
    );
}
