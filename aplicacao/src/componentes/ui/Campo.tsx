import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  rotulo: string;
  erro?: string;
  ajuda?: string;
};

const baseCls =
  'w-full rounded-lg border bg-white text-sm outline-none transition focus:ring-2 focus:ring-offset-0 focus:ring-teal-100';
const normalCls = 'border-slate-300 focus:border-primario';
const erroCls = 'border-red-400 focus:border-red-500 focus:ring-red-100';

export type CampoProps = InputHTMLAttributes<HTMLInputElement> & BaseProps & { iconeEsquerda?: ReactNode };

export function Campo({ rotulo, erro, ajuda, iconeEsquerda, id, className = '', ...props }: CampoProps) {
  const campoId = id ?? props.name;
  const temErro = Boolean(erro);

  return (
    <label htmlFor={campoId} className="block">
      <span className="text-sm font-medium text-slate-700">{rotulo}</span>
      <div className="relative mt-1.5">
        {iconeEsquerda && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {iconeEsquerda}
          </span>
        )}
        <input
          id={campoId}
          className={[
            baseCls,
            temErro ? erroCls : normalCls,
            'h-11',
            iconeEsquerda ? 'pl-9' : 'pl-3',
            'pr-3',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {temErro ? (
        <p className="mt-1 text-xs text-red-600">{erro}</p>
      ) : ajuda ? (
        <p className="mt-1 text-xs text-slate-500">{ajuda}</p>
      ) : null}
    </label>
  );
}

export type CampoAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps;

export function CampoArea({ rotulo, erro, ajuda, id, className = '', ...props }: CampoAreaProps) {
  const campoId = id ?? props.name;
  const temErro = Boolean(erro);

  return (
    <label htmlFor={campoId} className="block">
      <span className="text-sm font-medium text-slate-700">{rotulo}</span>
      <textarea
        id={campoId}
        className={[
          baseCls,
          temErro ? erroCls : normalCls,
          'mt-1.5 min-h-24 px-3 py-2.5',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {temErro ? (
        <p className="mt-1 text-xs text-red-600">{erro}</p>
      ) : ajuda ? (
        <p className="mt-1 text-xs text-slate-500">{ajuda}</p>
      ) : null}
    </label>
  );
}

type CampoSelectProps = BaseProps & {
  value: string;
  onChange: (valor: string) => void;
  required?: boolean;
  name?: string;
  children: ReactNode;
};

export function CampoSelect({ rotulo, erro, ajuda, value, onChange, required, name, children }: CampoSelectProps) {
  const temErro = Boolean(erro);

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{rotulo}</span>
      <select
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          baseCls,
          temErro ? erroCls : normalCls,
          'mt-1.5 h-11 px-3',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </select>
      {temErro ? (
        <p className="mt-1 text-xs text-red-600">{erro}</p>
      ) : ajuda ? (
        <p className="mt-1 text-xs text-slate-500">{ajuda}</p>
      ) : null}
    </label>
  );
}
