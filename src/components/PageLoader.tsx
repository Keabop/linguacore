export default function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-container)] animate-spin" style={{ mask: 'conic-gradient(transparent 30%, black)', WebkitMask: 'conic-gradient(transparent 30%, black)' }} />
        </div>
    );
}
