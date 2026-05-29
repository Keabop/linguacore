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
            const primary = i18n.t(key, { ...options, lng: 'en' }) as string;
            const secondary = i18n.t(key, { ...options, lng: 'es' }) as string;
            return { primary, secondary, isBilingual: true };
        } else if (mode === 'en') {
            return { primary: i18n.t(key, { ...options, lng: 'en' }) as string, secondary: '', isBilingual: false };
        } else {
            return { primary: i18n.t(key, { ...options, lng: 'es' }) as string, secondary: '', isBilingual: false };
        }
    };

    return { bt, t, mode };
}
