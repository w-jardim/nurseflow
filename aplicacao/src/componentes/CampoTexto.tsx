import type { InputHTMLAttributes } from 'react';

type CampoTextoProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
};

export function CampoTexto({ rotulo, id, ...props }: CampoTextoProps) {
  const campoId = id ?? props.name;

  return (
    <label htmlFor={campoId} className="block">
      <span className="text-sm font-medium text-slate-800">{rotulo}</span>
      <input
        id={campoId}
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
        {...props}
      />
    </label>
  );
}
