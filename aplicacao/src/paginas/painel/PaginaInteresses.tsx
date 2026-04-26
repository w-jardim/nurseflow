import { useEffect, useState } from 'react';
import { PainelInteresses } from '../../componentes/PainelInteresses';
import { requisitarApi } from '../../servicos/api';
import type { InteressePublico } from '../../tipos/interesses';

export function PaginaInteresses() {
  const [interesses, setInteresses] = useState<InteressePublico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<InteressePublico[]>('/interesses', { autenticada: true })
      .then(setInteresses)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return <PainelInteresses interesses={interesses} />;
}
