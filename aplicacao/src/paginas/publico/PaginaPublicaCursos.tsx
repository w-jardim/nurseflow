import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ModalContato, type InteresseItem } from '../../componentes/publico/ModalContato';
import type { OutletContexto } from '../PaginaPublicaProfissional';
import { formatarReais } from '../../utilitarios/moeda';

const GRADIENT = 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)';

export function PaginaPublicaCursos() {
  const { pagina } = useOutletContext<OutletContexto>();
  const { slug } = useParams();
  const [interesse, setInteresse] = useState<InteresseItem | null>(null);

  if (pagina.cursos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-slate-500">Nenhum curso disponível no momento.</p>
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
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Cursos</h1>
          <p className="mt-2 text-white/70">
            {pagina.nomePublico} · {pagina.cursos.length} curso{pagina.cursos.length !== 1 ? 's' : ''} disponíve{pagina.cursos.length !== 1 ? 'is' : 'l'}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pagina.cursos.map((curso) => (
            <article
              key={curso.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              {/* Card header */}
              <div className="flex items-center justify-between rounded-t-2xl bg-blue-50 px-5 py-4">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {curso.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                </span>
                <span className="text-lg font-bold text-blue-900">{formatarReais(curso.precoCentavos)}</span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold text-slate-900">{curso.titulo}</h2>
                {curso.descricao && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{curso.descricao}</p>
                )}
                <button
                  className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  onClick={() => setInteresse({ origem: 'CURSO', titulo: curso.titulo, cursoId: curso.id })}
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
