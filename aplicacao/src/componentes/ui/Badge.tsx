import { ReactNode } from 'react';

type Cor = 'verde' | 'vermelho' | 'amarelo' | 'azul' | 'cinza' | 'roxo' | 'ciano';

type BadgeProps = {
  children: ReactNode;
  cor?: Cor;
};

const CORES: Record<Cor, string> = {
  verde: 'bg-emerald-100 text-emerald-700',
  vermelho: 'bg-red-100 text-red-700',
  amarelo: 'bg-amber-100 text-amber-700',
  azul: 'bg-blue-100 text-blue-700',
  cinza: 'bg-slate-100 text-slate-600',
  roxo: 'bg-purple-100 text-purple-700',
  ciano: 'bg-teal-100 text-teal-700',
};

export function Badge({ children, cor = 'cinza' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CORES[cor]}`}>
      {children}
    </span>
  );
}
