import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSessao } from '../../contextos/SessaoContexto';
import { requisitarApi } from '../../servicos/api';
import type { Contato } from '../../tipos/contatos';
import type { Curso } from '../../tipos/cursos';
import type { Consulta } from '../../tipos/consultas';

type Card = { rotulo: string; valor: number | string; cor: string; para: string };

function CardEstatistica({ rotulo, valor, cor, para }: Card) {
  return (
    <Link
      to={para}
      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{rotulo}</span>
      <span className={`text-3xl font-bold ${cor}`}>{valor}</span>
    </Link>
  );
}

export function PaginaDashboard() {
  const { usuario, perfil } = useSessao();

  if (usuario?.papel === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
  const [totais, setTotais] = useState({ alunos: 0, pacientes: 0, cursos: 0, consultas: 0 });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      requisitarApi<Contato[]>('/alunos', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
      requisitarApi<Curso[]>('/cursos', { autenticada: true }),
      requisitarApi<Consulta[]>('/consultas', { autenticada: true }),
    ])
      .then(([alunos, pacientes, cursos, consultas]) => {
        setTotais({
          alunos: alunos.length,
          pacientes: pacientes.length,
          cursos: cursos.filter((c) => c.status === 'PUBLICADO').length,
          consultas: consultas.filter((c) => c.status === 'AGENDADA').length,
        });
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Olá, {usuario?.nome?.split(' ')[0]} 👋
        </h1>
        {perfil?.slug && (
          <p className="mt-1 text-sm text-slate-500">
            Sua página pública:{' '}
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

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardEstatistica rotulo="Alunos" valor={totais.alunos} cor="text-primario" para="/painel/alunos" />
          <CardEstatistica rotulo="Pacientes" valor={totais.pacientes} cor="text-rose-600" para="/painel/pacientes" />
          <CardEstatistica rotulo="Cursos publicados" valor={totais.cursos} cor="text-destaque" para="/painel/cursos" />
          <CardEstatistica rotulo="Consultas agendadas" valor={totais.consultas} cor="text-amber-600" para="/painel/consultas" />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Acesso rápido</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { rotulo: 'Cadastrar aluno', para: '/painel/alunos' },
            { rotulo: 'Agendar consulta', para: '/painel/consultas' },
            { rotulo: 'Criar curso', para: '/painel/cursos' },
            { rotulo: 'Ver interesses', para: '/painel/interesses' },
            { rotulo: 'Editar perfil', para: '/painel/perfil' },
            { rotulo: 'Log de auditoria', para: '/painel/auditoria' },
          ].map((item) => (
            <Link
              key={item.para}
              to={item.para}
              className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-primario hover:text-primario"
            >
              {item.rotulo} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
