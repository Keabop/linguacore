import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTier } from '../hooks/useTier';
import type { ReactNode } from 'react';

interface ProGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

export function ProGate({ children, feature, fallback }: ProGateProps) {
  const { isPro } = useTier();

  if (isPro) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 bg-bg-card border border-border rounded-2xl text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Disponible en Plan Pro
        </h3>
        <p className="text-sm text-text-muted max-w-xs">
          {feature}
        </p>
      </div>
      <Link
        to="/pricing"
        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-all text-sm"
      >
        Ver Plan Pro — $129/mes
      </Link>
    </div>
  );
}
