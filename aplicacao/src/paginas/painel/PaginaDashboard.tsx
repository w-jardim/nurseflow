import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSessao } from '../../contextos/SessaoContexto';
import { requisitarApi } from '../../servicos/api';
import { AgendaCalendario, type ItemAgenda } from '../../componentes/AgendaCalendario';
import { Esqueleto } from '../../componentes/ui/Esqueleto';
import type { Contato } from '../../tipos/contatos';
import type { Curso } from '../../tipos/cursos';
import type { Consulta } from '../../tipos/consultas';
import type { Consultoria } from '../../tipos/consultorias';

type Stat = { rotulo: string; valor: number | string; cor: string; svg: string; para: string };

function CardStat({ rotulo, valor, cor, svg, para }: Stat) {
  return (
    <Link
      to={para}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-card-hover"
    >
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cor}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={svg} />
        </svg>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{rotulo}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-800">{valor}</p>
      </div>
    </Link>
  );
}

const ACESSO_RAPIDO = [
  { rotulo: 'Cadastrar aluno', para: '/painel/alunos', svg: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { rotulo: 'Novo paciente', para: '/painel/pacientes', svg: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { rotulo: 'Agendar consulta', para: '/painel/consultas', svg: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { rotulo: 'Criar curso', para: '/painel/cursos', svg: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { rotulo: 'Ver interesses', para: '/painel/interesses', svg: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { rotulo: 'Editar perfil', para: '/painel/perfil', svg: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export function PaginaDashboard() {
  const { usuario, perfil } = useSessao();

  if (usuario?.papel === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;

  const [totais, setTotais] = useState({ alunos: 0, pacientes: 0, cursos: 0, consultas: 0 });
  const [agenda, setAgenda] = useState<ItemAgenda[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      requisitarApi<Contato[]>('/alunos', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
      requisitarApi<Curso[]>('/cursos', { autenticada: true }),
      requisitarApi<Consulta[]>('/consultas', { autenticada: true }),
      requisitarApi<Consultoria[]>('/consultorias', { autenticada: true }),
    ])
      .then(([alunos, pacientes, cursos, consultas, consultorias]) => {
        setTotais({
          alunos: alunos.length,
          pacientes: pacientes.length,
          cursos: cursos.filter((c) => c.status === 'PUBLICADO').length,
          consultas: consultas.filter((c) => c.status === 'AGENDADA').length,
        });
        setAgenda([
          ...consultas.map((consulta) => ({
            id: consulta.id,
            tipo: 'consulta' as const,
            titulo: [consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' '),
            subtitulo: consulta.paciente.telefone ?? consulta.paciente.email,
            inicioEm: consulta.inicioEm,
            fimEm: consulta.fimEm,
            status: consulta.status,
            para: '/painel/consultas',
          })),
          ...consultorias
            .filter((consultoria) => consultoria.inicioEm && consultoria.fimEm)
            .map((consultoria) => ({
              id: consultoria.id,
              tipo: 'consultoria' as const,
              titulo: consultoria.titulo,
              subtitulo: consultoria.modalidade === 'ONLINE' ? 'Online' : 'Presencial',
              inicioEm: consultoria.inicioEm as string,
              fimEm: consultoria.fimEm as string,
              status: consultoria.status,
              para: '/painel/consultorias',
            })),
        ]);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Olá, {primeiroNome} 👋</h1>
          {perfil?.slug && (
            <p className="mt-1 text-sm text-slate-500">
              Página pública:{' '}
              <a
                href={`/${perfil.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primario hover:underline"
              >
                /{perfil.slug}
              </a>
            </p>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Esqueleto key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardStat
            rotulo="Alunos"
            valor={totais.alunos}
            cor="bg-teal-50 text-primario"
            svg="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            para="/painel/alunos"
          />
          <CardStat
            rotulo="Pacientes"
            valor={totais.pacientes}
            cor="bg-rose-50 text-rose-600"
            svg="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            para="/painel/pacientes"
          />
          <CardStat
            rotulo="Cursos publicados"
            valor={totais.cursos}
            cor="bg-blue-50 text-blue-600"
            svg="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            para="/painel/cursos"
          />
          <CardStat
            rotulo="Consultas agendadas"
            valor={totais.consultas}
            cor="bg-amber-50 text-amber-600"
            svg="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            para="/painel/consultas"
          />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Acesso rápido</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ACESSO_RAPIDO.map((item) => (
            <Link
              key={item.para}
              to={item.para}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-primario hover:bg-teal-50 hover:text-primario"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.svg} />
              </svg>
              {item.rotulo}
            </Link>
          ))}
        </div>
      </div>

      <AgendaCalendario
        itens={agenda}
        titulo="Calendário da semana"
        descricao="Consultas e consultorias ficam juntas para proteger seus horários."
        compacto
        acao={{ rotulo: 'Abrir agenda', para: '/painel/consultas' }}
      />
    </div>
  );
}
