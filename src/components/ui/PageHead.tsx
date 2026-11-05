import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PageHeadProps {
    title: ReactNode;
    /** One short line under the title */
    lead?: ReactNode;
    /** Small facts in mono under the title (level, counts); the date goes first when `dated` */
    meta?: ReactNode[];
    dated?: boolean;
    /** Controls aligned with the title (a back link, a filter) */
    actions?: ReactNode;
    titleId?: string;
}

/** A notebook entry: the title, what the page is about and a ruled line under it */
export default function PageHead({ title, lead, meta = [], dated = false, actions, titleId }: PageHeadProps) {
    const { i18n } = useTranslation();
    const facts = meta.filter(Boolean);
    const now = new Date();
    const today = dated
        ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
        : null;
    // The local day, not UTC's (in Mexico UTC is already tomorrow in the evening)
    const isoDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return (
        <header className="app-head">
            <div className="app-head-row">
                <h1 id={titleId} className="app-title">{title}</h1>
                {actions && <div className="app-head-actions">{actions}</div>}
            </div>
            {lead && <p className="app-lead">{lead}</p>}
            {(today || facts.length > 0) && (
                <p className="app-meta">
                    {today && <time dateTime={isoDay}>{today}</time>}
                    {facts.map((fact, i) => <span key={i}>{fact}</span>)}
                </p>
            )}
        </header>
    );
}
