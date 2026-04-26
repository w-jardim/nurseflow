import type { InteressePublico } from '../tipos/interesses';
import { mascararTelefone } from '../utilitarios/mascaras';

type PainelInteressesProps = {
  interesses: InteressePublico[];
};

function descreverOrigem(interesse: InteressePublico) {
  if (interesse.curso) {
    return `Curso: ${interesse.curso.titulo}`;
  }

  if (interesse.consultoria) {
    return `Consultoria: ${interesse.consultoria.titulo}`;
  }

  return 'Página profissional';
}

export function PainelInteresses({ interesses }: PainelInteressesProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Interesses recebidos</h2>
        <p className="mt-1 text-sm text-slate-600">Contatos enviados pela sua página pública.</p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {interesses.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum interesse recebido.</p>
        ) : (
          <ul className="space-y-3">
            {interesses.map((interesse) => (
              <li key={interesse.id} className="rounded-md bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{interesse.nome}</p>
                    <p className="mt-1 text-sm text-slate-600">{descreverOrigem(interesse)}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(interesse.criadoEm).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {[interesse.email, interesse.telefone ? mascararTelefone(interesse.telefone) : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {interesse.mensagem ? <p className="mt-2 text-sm text-slate-600">{interesse.mensagem}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
