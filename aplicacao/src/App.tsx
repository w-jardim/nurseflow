import { limitesPorPlano } from '@nurseflow/compartilhado';

const recursos = [
  'Paginas publicas para profissionais',
  'Gestao de alunos e pacientes',
  'Cursos, agenda e pagamentos em uma unica base',
];

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primario">NurseFlow</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          SaaS para profissionais de saude venderem, atenderem e crescerem.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-700">
          Fundacao tecnica da plataforma criada com React, NestJS, Prisma, PostgreSQL e Redis.
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
