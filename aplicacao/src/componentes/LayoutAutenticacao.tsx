import { Link, Outlet } from 'react-router-dom';

const FEATURES = [
  {
    icone: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    texto: 'Cursos e conteúdo EAD com inscrições',
  },
  {
    icone: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    texto: 'Gestão de alunos e pacientes integrada',
  },
  {
    icone: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    texto: 'Agenda e consultorias com histórico',
  },
  {
    icone: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    texto: 'Pagamentos via Mercado Pago',
  },
];

export function LayoutAutenticacao() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <div
          className="hidden flex-col justify-between p-10 lg:flex lg:w-[420px] xl:w-[460px]"
          style={{ background: 'linear-gradient(160deg, #134e4a 0%, #0f766e 100%)' }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">NurseFlow</span>
          </Link>

          <div>
            <h2 className="text-2xl font-bold leading-snug text-white">
              Sua central profissional de saúde.
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Tudo que você precisa para gerenciar e expandir sua prática profissional.
            </p>
            <ul className="mt-8 space-y-4">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-white/80">
                    {f.icone}
                  </span>
                  <span className="text-sm text-white/75">{f.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/25">© {new Date().getFullYear()} Plagard Systems</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primario">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-primario">NurseFlow</span>
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
