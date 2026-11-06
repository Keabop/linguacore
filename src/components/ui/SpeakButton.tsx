import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';
import { canSpeak, speakEnglish } from '../../lib/speakEnglish';

/** A speaker that reads its English aloud: every word and example can be heard, not only read. */
export default function SpeakButton({ text, className = '' }: { text: string; className?: string }) {
    const { t } = useTranslation();
    if (!canSpeak()) return null;
    return (
        <button
            type="button"
            onClick={e => { e.stopPropagation(); speakEnglish(text); }}
            aria-label={t('audio.listenTo', { text })}
            title={t('audio.listen')}
            className={`speak-button ${className}`}
        >
            <Volume2 className="size-4" aria-hidden="true" />
        </button>
    );
}
