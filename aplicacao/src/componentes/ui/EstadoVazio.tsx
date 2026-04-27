import { ReactNode } from 'react';
import { Botao } from './Botao';

type EstadoVazioProps = {
  titulo: string;
  descricao?: string;
  icone?: ReactNode;
  acaoRotulo?: string;
  aoAcionar?: () => void;
};

export function EstadoVazio({ titulo, descricao, icone, acaoRotulo, aoAcionar }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {icone && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icone}
        </div>
      )}
      <p className="font-semibold text-slate-700">{titulo}</p>
      {descricao && <p className="mt-1 max-w-xs text-sm text-slate-500">{descricao}</p>}
      {acaoRotulo && aoAcionar && (
        <div className="mt-4">
          <Botao variante="contorno" tamanho="sm" onClick={aoAcionar}>
            {acaoRotulo}
          </Botao>
        </div>
      )}
    </div>
  );
}
