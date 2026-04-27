import { EstadoVazio } from './ui/EstadoVazio';
import { Badge } from './ui/Badge';
import type { InteressePublico } from '../tipos/interesses';
import { mascararTelefone } from '../utilitarios/mascaras';

type PainelInteressesProps = {
  interesses: InteressePublico[];
};

function descreverOrigem(interesse: InteressePublico) {
  if (interesse.curso) return interesse.curso.titulo;
  if (interesse.consultoria) return interesse.consultoria.titulo;
  return 'Página profissional';
}

function corOrigem(interesse: InteressePublico) {
  if (interesse.curso) return 'azul' as const;
  if (interesse.consultoria) return 'roxo' as const;
  return 'ciano' as const;
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function PainelInteresses({ interesses }: PainelInteressesProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-slate-800">Interesses recebidos</h2>
        <p className="mt-0.5 text-sm text-slate-500">Contatos enviados pela sua página pública.</p>
      </div>

      {interesses.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum interesse recebido"
          descricao="Quando alguém preencher o formulário na sua página pública, o contato aparecerá aqui."
          icone={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {interesses.map((interesse) => (
            <li key={interesse.id} className="flex items-start gap-4 px-6 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {iniciais(interesse.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">{interesse.nome}</p>
                  <time className="text-xs text-slate-400">
                    {new Date(interesse.criadoEm).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge cor={corOrigem(interesse)}>{descreverOrigem(interesse)}</Badge>
                </div>
                <p className="mt-1.5 text-sm text-slate-500">
                  {[interesse.email, interesse.telefone ? mascararTelefone(interesse.telefone) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {interesse.mensagem && (
                  <p className="mt-1 text-sm text-slate-500 italic">"{interesse.mensagem}"</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
