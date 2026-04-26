import { limitesPorPlano } from '@nurseflow/compartilhado';
import { Link } from 'react-router-dom';

const recursos = [
  'Páginas públicas para profissionais',
  'Gestão de alunos e pacientes',
  'Cursos, agenda e pagamentos em uma única base',
];

export function PaginaInicial() {
  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primario">NurseFlow</p>
          <nav className="flex gap-3">
            <Link className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700" to="/autenticacao/login">
              Entrar
            </Link>
            <Link
              className="rounded-md bg-primario px-4 py-2 text-sm font-semibold text-white"
              to="/autenticacao/cadastro"
            >
              Criar conta
            </Link>
          </nav>
        </div>

        <h1 className="mt-10 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          SaaS para profissionais de saúde venderem, atenderem e crescerem.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-700">
          Fundação técnica da plataforma criada com React, NestJS, Prisma, PostgreSQL e Redis.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {recursos.map((recurso) => (
            <article key={recurso} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold">{recurso}</h2>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-teal-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Limites iniciais do plano gratuito</h2>
          <p className="mt-2 text-slate-700">
            {limitesPorPlano.GRATUITO.alunos} alunos, {limitesPorPlano.GRATUITO.pacientes} pacientes e{' '}
            {limitesPorPlano.GRATUITO.cursos} curso.
          </p>
        </div>
      </section>
    </main>
  );
}
