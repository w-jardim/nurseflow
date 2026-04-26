import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { requisitarApi } from '../servicos/api';
import type { PaginaPublicaProfissional } from '../tipos/profissionais';
import { formatarReais } from '../utilitarios/moeda';
import { mascararTelefone } from '../utilitarios/mascaras';

export function PaginaPublicaProfissional() {
  const { slug } = useParams();
  const [pagina, setPagina] = useState<PaginaPublicaProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug) {
      setErro(true);
      setCarregando(false);
      return;
    }

    requisitarApi<PaginaPublicaProfissional>(`/publico/profissionais/${slug}`)
      .then((resposta) => setPagina(resposta))
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
        <p>Carregando página...</p>
      </main>
    );
  }

  if (erro || !pagina) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-slate-700">
        <div>
          <p className="text-lg font-semibold text-tinta">Página não encontrada.</p>
          <Link className="mt-4 inline-block font-semibold text-primario" to="/">
            Voltar para NurseFlow
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold text-primario">
            NurseFlow
          </Link>
          <span className="text-sm text-slate-500">/{pagina.slug}</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primario">Página profissional</p>
          <h1 className="mt-3 text-4xl font-bold">{pagina.nomePublico}</h1>
          {pagina.conselho ? <p className="mt-2 text-slate-700">{pagina.conselho}</p> : null}
          {pagina.bio ? <p className="mt-5 text-lg leading-8 text-slate-700">{pagina.bio}</p> : null}
          {pagina.telefone ? (
            <p className="mt-5 text-sm font-semibold text-slate-700">
              Contato: {mascararTelefone(pagina.telefone)}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold">Cursos</h2>
            <div className="mt-4 space-y-3">
              {pagina.cursos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum curso publicado.</p>
              ) : (
                pagina.cursos.map((curso) => (
                  <article key={curso.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{curso.titulo}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {curso.modalidade === 'ONLINE' ? 'Curso online' : 'Curso presencial'}
                        </p>
                      </div>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold">
                        {formatarReais(curso.precoCentavos)}
                      </span>
                    </div>
                    {curso.descricao ? <p className="mt-3 text-sm text-slate-600">{curso.descricao}</p> : null}
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Consultorias</h2>
            <div className="mt-4 space-y-3">
              {pagina.consultorias.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma consultoria cadastrada.</p>
              ) : (
                pagina.consultorias.map((consultoria) => (
                  <article key={consultoria.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{consultoria.titulo}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {consultoria.modalidade === 'ONLINE' ? 'Consultoria online' : 'Consultoria presencial'}
                        </p>
                      </div>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold">
                        {formatarReais(consultoria.precoCentavos)}
                      </span>
                    </div>
                    {consultoria.descricao ? (
                      <p className="mt-3 text-sm text-slate-600">{consultoria.descricao}</p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
