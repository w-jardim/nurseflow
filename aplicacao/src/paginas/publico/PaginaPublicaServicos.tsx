import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ModalContato, type InteresseItem } from '../../componentes/publico/ModalContato';
import type { OutletContexto } from '../PaginaPublicaProfissional';
import { formatarReais } from '../../utilitarios/moeda';

const GRADIENT = 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)';

export function PaginaPublicaServicos() {
  const { pagina } = useOutletContext<OutletContexto>();
  const { slug } = useParams();
  const [interesse, setInteresse] = useState<InteresseItem | null>(null);

  if (pagina.servicos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-slate-500">Nenhum serviço disponível no momento.</p>
        <Link to={`/${slug}`} className="mt-4 text-sm font-semibold text-primario hover:underline">
          ← Voltar ao perfil
        </Link>
      </div>
    );
  }

  return (
    <>
      {interesse && (
        <ModalContato slug={pagina.slug} interesse={interesse} aoFechar={() => setInteresse(null)} />
      )}

      {/* Mini hero */}
      <section className="relative overflow-hidden py-14" style={{ background: GRADIENT }}>
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to={`/${slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao perfil
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Serviços</h1>
          <p className="mt-2 text-white/70">
            {pagina.nomePublico} · {pagina.servicos.length} serviço{pagina.servicos.length !== 1 ? 's' : ''} disponíve{pagina.servicos.length !== 1 ? 'is' : 'l'}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagina.servicos.map((servico) => (
            <article
              key={servico.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between rounded-t-2xl bg-emerald-50 px-5 py-4">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Serviço profissional
                </span>
                <span className="text-lg font-bold text-emerald-900">
                  {servico.exibirPreco ? formatarReais(servico.precoCentavos) : 'Sob consulta'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold text-slate-900">{servico.titulo}</h2>
                {servico.descricao && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{servico.descricao}</p>
                )}
                <button
                  className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  onClick={() => setInteresse({ origem: 'SERVICO', titulo: servico.titulo, servicoId: servico.id })}
                  type="button"
                >
                  Tenho interesse
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
