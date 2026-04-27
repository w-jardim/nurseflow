import { limitesPorPlano } from '@nurseflow/compartilhado';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icone: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    titulo: 'Cursos EAD',
    desc: 'Crie e venda cursos com módulos, aulas e inscrições de alunos integradas.',
  },
  {
    icone: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    titulo: 'Gestão de pacientes',
    desc: 'Organize alunos e pacientes com fichas completas, CPF, endereço e histórico.',
  },
  {
    icone: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    titulo: 'Agenda e consultas',
    desc: 'Agende atendimentos presenciais e online, com status e observações.',
  },
  {
    icone: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    titulo: 'Pagamentos integrados',
    desc: 'Receba via PIX, link externo ou assinatura recorrente pelo Mercado Pago.',
  },
  {
    icone: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    titulo: 'Página pública',
    desc: 'Cada profissional tem uma página personalizada para captar interesses.',
  },
  {
    icone: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    titulo: 'Auditoria completa',
    desc: 'Log de todas as ações do sistema para transparência e conformidade.',
  },
];

const PLANOS = [
  {
    nome: 'Gratuito',
    preco: 'R$ 0',
    periodo: 'para sempre',
    cor: 'border-slate-200',
    botao: 'contorno',
    alunos: limitesPorPlano.GRATUITO.alunos,
    pacientes: limitesPorPlano.GRATUITO.pacientes,
    cursos: limitesPorPlano.GRATUITO.cursos,
  },
  {
    nome: 'PRO',
    preco: 'R$ 79,90',
    periodo: '/mês',
    cor: 'border-primario ring-1 ring-primario',
    destaque: true,
    botao: 'primario',
    alunos: limitesPorPlano.PRO.alunos,
    pacientes: limitesPorPlano.PRO.pacientes,
    cursos: limitesPorPlano.PRO.cursos,
  },
  {
    nome: 'Standard',
    preco: 'R$ 149,90',
    periodo: '/mês',
    cor: 'border-slate-200',
    botao: 'contorno',
    alunos: limitesPorPlano.STANDARD.alunos,
    pacientes: limitesPorPlano.STANDARD.pacientes,
    cursos: limitesPorPlano.STANDARD.cursos,
  },
];

export function PaginaInicial() {
  return (
    <div className="min-h-screen bg-white text-tinta">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primario">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-primario">NurseFlow</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              to="/autenticacao/login"
            >
              Entrar
            </Link>
            <Link
              className="rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-800"
              to="/autenticacao/cadastro"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-primario">
          <span className="h-1.5 w-1.5 rounded-full bg-primario" />
          Plataforma SaaS para profissionais de saúde
        </div>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Venda, atenda e{' '}
          <span className="text-primario">cresça</span>{' '}
          com uma plataforma só.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
          Cursos online, gestão de pacientes, agenda e pagamentos integrados para enfermeiros,
          terapeutas e demais profissionais de saúde.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/autenticacao/cadastro"
            className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primario-800"
          >
            Criar conta grátis
          </Link>
          <Link
            to="/autenticacao/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primario">Recursos</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Tudo para sua prática profissional
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.titulo}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-primario">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icone} />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">{f.titulo}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primario">Planos</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Comece grátis, escale quando precisar
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PLANOS.map((plano) => (
              <div
                key={plano.nome}
                className={`relative rounded-2xl border bg-white p-6 shadow-card ${plano.cor}`}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primario px-3 py-0.5 text-xs font-semibold text-white">
                      Mais popular
                    </span>
                  </div>
                )}
                <p className="font-semibold text-slate-800">{plano.nome}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{plano.preco}</span>
                  <span className="text-sm text-slate-500">{plano.periodo}</span>
                </div>
                <ul className="mt-5 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-primario">✓</span>
                    {plano.alunos === -1 ? 'Alunos ilimitados' : `Até ${plano.alunos} alunos`}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-primario">✓</span>
                    {plano.pacientes === -1 ? 'Pacientes ilimitados' : `Até ${plano.pacientes} pacientes`}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-primario">✓</span>
                    {(plano.cursos ?? 0) < 0 ? 'Cursos ilimitados' : `Até ${plano.cursos ?? 0} curso${(plano.cursos ?? 0) > 1 ? 's' : ''}`}
                  </li>
                </ul>
                <Link
                  to="/autenticacao/cadastro"
                  className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                    plano.destaque
                      ? 'bg-primario text-white hover:bg-primario-800'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <p className="text-center text-sm text-slate-400">
          © {new Date().getFullYear()}{' '}
          <span className="font-medium text-slate-500">Plagard Systems</span>. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
