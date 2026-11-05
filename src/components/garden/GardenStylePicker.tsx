import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette } from 'lucide-react';
import { useGardenStyle, type GardenStyle } from '../../hooks/useGardenPlant';

const STYLES: GardenStyle[] = ['pixel', 'classic'];

/** Settings: how the 3D garden of the path is drawn */
export default function GardenStylePicker() {
    const { t } = useTranslation();
    const { style, setStyle } = useGardenStyle();
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);

    const choose = async (next: GardenStyle) => {
        if (next === style || saving) return;
        setSaving(true);
        setFailed(false);
        try { await setStyle(next); } catch { setFailed(true); } finally { setSaving(false); }
    };

    return (
        <fieldset className="space-y-3 text-left">
            <legend className="flex items-center gap-3 mb-1">
                <Palette className="w-5 h-5 text-[var(--color-on-surface-muted)]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">{t('garden.styleTitle')}</span>
            </legend>
            <p className="text-xs text-[var(--color-on-surface-muted)]">{t('garden.styleHint')}</p>
            <div className="app-tabs" role="radiogroup" aria-label={t('garden.styleTitle')}>
                {STYLES.map(s => (
                    <button key={s} type="button" role="radio" aria-checked={style === s} aria-pressed={style === s} disabled={saving} onClick={() => choose(s)}>
                        {t(`garden.style.${s}`)}
                    </button>
                ))}
            </div>
            {failed && <p role="alert" className="text-xs text-[var(--color-error)]">{t('garden.styleFailed')}</p>}
        </fieldset>
    );
}
