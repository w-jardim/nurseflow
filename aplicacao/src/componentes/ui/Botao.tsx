import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'contorno';
type Tamanho = 'sm' | 'md' | 'lg';

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  carregando?: boolean;
  icone?: ReactNode;
};

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-primario text-white hover:bg-primario-800 focus-visible:ring-teal-300 disabled:bg-slate-200 disabled:text-slate-400',
  secundario:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-300 disabled:opacity-50',
  fantasma:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-300 disabled:opacity-50',
  perigo:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 disabled:opacity-50',
  contorno:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300 disabled:opacity-50',
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export function Botao({
  variante = 'primario',
  tamanho = 'md',
  larguraTotal = false,
  carregando = false,
  icone,
  children,
  disabled,
  className = '',
  ...props
}: BotaoProps) {
  return (
    <button
      disabled={disabled || carregando}
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        larguraTotal ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {carregando ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icone ? (
        <span className="flex-shrink-0">{icone}</span>
      ) : null}
      {children}
    </button>
  );
}
