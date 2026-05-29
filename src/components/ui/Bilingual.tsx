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
