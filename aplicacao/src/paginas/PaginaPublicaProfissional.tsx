import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { requisitarApi } from '../servicos/api';
import type { PaginaPublicaProfissional as TipoPagina } from '../tipos/profissionais';

export type OutletContexto = { pagina: TipoPagina };

const GRADIENT = 'linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #047857 100%)';

export function PaginaPublicaProfissional() {
  const { slug } = useParams();
  const [pagina, setPagina] = useState<TipoPagina | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug) { setErro(true); setCarregando(false); return; }
    requisitarApi<TipoPagina>(`/publico/profissionais/${slug}`)
      .then(setPagina)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: GRADIENT }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-white/60">Carregando...</p>
      </div>
    );
  }

  if (erro || !pagina) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">Este profissional não existe ou a página foi removida.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
          Conhecer o NurseFlow
        </Link>
      </div>
    );
  }

  const navLinks = [
    pagina.cursos.length > 0 && { rotulo: 'Cursos', para: `/${slug}/cursos` },
    pagina.servicos.length > 0 && { rotulo: 'Serviços', para: `/${slug}/servicos` },
    pagina.consultorias.length > 0 && { rotulo: 'Consultorias', para: `/${slug}/consultorias` },
    { rotulo: 'Agendar', para: `/${slug}/agendar` },
  ].filter(Boolean) as { rotulo: string; para: string }[];

  const classeLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-teal-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <NavLink
            to={`/${slug}`}
            end
            className="flex flex-shrink-0 items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            NurseFlow
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.para} to={link.para} className={classeLink}>
                {link.rotulo}
              </NavLink>
            ))}
          </nav>

          <Link
            to={`/${slug}/agendar`}
            className="flex-shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
          >
            Agendar consulta
          </Link>
        </div>
      </header>

      <Outlet context={{ pagina } as OutletContexto} />

      <footer className="border-t border-slate-200 bg-white py-6 text-center">
        <p className="text-sm text-slate-400">
          Criado com{' '}
          <Link to="/" className="font-semibold text-primario hover:underline">
            NurseFlow
          </Link>
        </p>
      </footer>
    </div>
  );
}
