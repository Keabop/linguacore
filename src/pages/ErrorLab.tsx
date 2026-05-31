import { useTranslation } from 'react-i18next';

export default function ErrorLab() {
    const { t } = useTranslation();
    return (
        <div className="py-8">
            <h1 className="text-2xl font-black">Laboratorio de Errores</h1>
        </div>
    );
}
