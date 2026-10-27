import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Crown, Sprout } from 'lucide-react';
import Plant from './Plant';
import { SPECIES, SPECIES_ORDER, type SpeciesId } from './species';
import { useGardenPlant } from '../../hooks/useGardenPlant';

/** Garden species chooser for Settings. Pro species are locked for free users. */
export default function PlantPicker({ onNavigate }: { onNavigate?: () => void }) {
    const { t } = useTranslation();
    const { species, setPlant, isPro } = useGardenPlant();
    const [selected, setSelected] = useState<SpeciesId>(species);
    const [error, setError] = useState(false);

    const choose = async (id: SpeciesId) => {
        const previous = selected;
        setSelected(id);
        setError(false);
        try {
            await setPlant(id);
        } catch {
            setSelected(previous);
            setError(true);
        }
    };

    return (
        <fieldset className="space-y-3 text-left">
            <legend className="flex items-center gap-3 mb-1">
                <Sprout className="w-5 h-5 text-[var(--color-on-surface-muted)]" aria-hidden="true" />
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">{t('garden.pickerTitle')}</span>
            </legend>
            <p className="text-xs text-[var(--color-on-surface-muted)]">{t('garden.pickerHint')}</p>

            <div className="plant-picker">
                {SPECIES_ORDER.map((id) => {
                    const locked = SPECIES[id].pro && !isPro;
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                name="garden-plant"
                                id={`plant-${id}`}
                                value={id}
                                checked={selected === id}
                                disabled={locked}
                                onChange={() => choose(id)}
                            />
                            <label htmlFor={`plant-${id}`} title={locked ? t('garden.proLocked') : undefined}>
                                <Plant species={id} stage="grown" height={44} />
                                {t(`garden.species.${id}`)}
                                {SPECIES[id].pro && (
                                    <span className="absolute top-1 right-1 text-[var(--color-tertiary)]">
                                        <Crown className="w-3 h-3" fill="currentColor" aria-hidden="true" />
                                        <span className="sr-only">{t('garden.proOnly')}</span>
                                    </span>
                                )}
                            </label>
                        </div>
                    );
                })}
            </div>

            {!isPro && (
                <p className="text-xs text-[var(--color-on-surface-muted)]">
                    {t('garden.proLocked')} ·{' '}
                    <Link to="/pricing" onClick={onNavigate} className="font-semibold text-[var(--color-primary)] underline underline-offset-2">
                        {t('garden.seeplans')}
                    </Link>
                </p>
            )}
            {error && <p role="alert" className="text-xs font-semibold text-[var(--color-error)]">{t('garden.saveError')}</p>}
        </fieldset>
    );
}
