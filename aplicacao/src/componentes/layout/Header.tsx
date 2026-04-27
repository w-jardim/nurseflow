import { useLocation } from 'react-router-dom';
import { useSessao } from '../../contextos/SessaoContexto';

const TITULOS: Record<string, string> = {
  '/painel': 'Painel',
  '/painel/alunos': 'Alunos',
  '/painel/pacientes': 'Pacientes',
  '/painel/cursos': 'Cursos',
  '/painel/servicos': 'Serviços',
  '/painel/consultas': 'Consultas',
  '/painel/consultorias': 'Consultorias',
  '/painel/interesses': 'Interesses',
  '/painel/agendamentos': 'Agendamentos',
  '/painel/auditoria': 'Auditoria',
  '/painel/perfil': 'Perfil',
  '/aluno/cursos': 'Meus Cursos',
  '/admin': 'Métricas',
  '/admin/profissionais': 'Profissionais',
};

type Props = { aoAbrirMenu: () => void };

export function Header({ aoAbrirMenu }: Props) {
  const { usuario, sair } = useSessao();
  const { pathname } = useLocation();

  const titulo = TITULOS[pathname] ?? 'NurseFlow';
  const iniciais = usuario?.nome
    ? usuario.nome
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '--';

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={aoAbrirMenu}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-slate-800">{titulo}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        <p className="hidden text-sm text-slate-600 sm:block">{usuario?.nome}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primario text-xs font-bold text-white">
          {iniciais}
        </div>
        <button
          onClick={sair}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          title="Sair"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
