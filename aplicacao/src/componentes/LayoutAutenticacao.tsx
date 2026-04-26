import { Link, Outlet } from 'react-router-dom';

export function LayoutAutenticacao() {
  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <Link to="/" className="text-sm font-semibold uppercase tracking-wide text-primario">
            NurseFlow
          </Link>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Acesse sua central profissional.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-700">
            Entre para gerenciar cursos, pacientes, alunos e atendimentos em uma única base.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
