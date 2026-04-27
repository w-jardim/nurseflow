import type { InputHTMLAttributes } from 'react';
import { Campo } from './ui/Campo';

type CampoTextoProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
};

export function CampoTexto({ rotulo, ...props }: CampoTextoProps) {
  return <Campo rotulo={rotulo} {...props} />;
}
