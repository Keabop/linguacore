import { useRef, type KeyboardEvent, type ReactNode } from 'react';

interface PillTabsProps<T extends string> {
    tabs: { value: T; label: ReactNode }[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    /** Ids come from here: `${idBase}-tab-${value}` and `${idBase}-panel-${value}` */
    idBase: string;
    className: string;
}

export const tabId = (idBase: string, value: string) => `${idBase}-tab-${value}`;
export const panelId = (idBase: string, value: string) => `${idBase}-panel-${value}`;

/** Pill tabs with the keyboard of a tab list: one stop for Tab, arrows and Home/End move between them */
export default function PillTabs<T extends string>({ tabs, value, onChange, label, idBase, className }: PillTabsProps<T>) {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const onKey = (e: KeyboardEvent, i: number) => {
        const last = tabs.length - 1;
        const next = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
            : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
            : e.key === 'Home' ? 0
            : e.key === 'End' ? last
            : -1;
        if (next < 0) return;
        e.preventDefault();
        onChange(tabs[next].value);
        refs.current[next]?.focus();
    };

    return (
        <div role="tablist" aria-label={label} className={className}>
            {tabs.map((tab, i) => (
                <button
                    key={tab.value}
                    ref={el => { refs.current[i] = el; }}
                    id={tabId(idBase, tab.value)}
                    type="button"
                    role="tab"
                    aria-selected={tab.value === value}
                    aria-controls={panelId(idBase, tab.value)}
                    tabIndex={tab.value === value ? 0 : -1}
                    onClick={() => onChange(tab.value)}
                    onKeyDown={e => onKey(e, i)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
