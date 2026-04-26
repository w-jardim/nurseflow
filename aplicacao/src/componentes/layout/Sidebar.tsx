import { NavLink } from 'react-router-dom';
import { useSessao } from '../../contextos/SessaoContexto';

type ItemNav = { rotulo: string; para: string; icone: JSX.Element };

function Icone({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ITENS_PROFISSIONAL: ItemNav[] = [
  { rotulo: 'Painel', para: '/painel', icone: <Icone d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { rotulo: 'Alunos', para: '/painel/alunos', icone: <Icone d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
  { rotulo: 'Pacientes', para: '/painel/pacientes', icone: <Icone d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
  { rotulo: 'Cursos', para: '/painel/cursos', icone: <Icone d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
  { rotulo: 'Consultas', para: '/painel/consultas', icone: <Icone d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { rotulo: 'Consultorias', para: '/painel/consultorias', icone: <Icone d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  { rotulo: 'Interesses', para: '/painel/interesses', icone: <Icone d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
  { rotulo: 'Auditoria', para: '/painel/auditoria', icone: <Icone d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
  { rotulo: 'Perfil', para: '/painel/perfil', icone: <Icone d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
];

const ITENS_ADMIN: ItemNav[] = [
  { rotulo: 'Métricas', para: '/admin', icone: <Icone d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
  { rotulo: 'Profissionais', para: '/admin/profissionais', icone: <Icone d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
];

type Props = { aberto: boolean; aoFechar: () => void };

export function Sidebar({ aberto, aoFechar }: Props) {
  const { usuario } = useSessao();
  const itens = usuario?.papel === 'SUPER_ADMIN' ? ITENS_ADMIN : ITENS_PROFISSIONAL;

  const classeItem = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-white/20 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
    }`;

  const conteudo = (
    <div className="flex h-full flex-col bg-primario">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-lg font-bold tracking-tight text-white">NurseFlow</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {itens.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.para === '/painel' || item.para === '/admin'}
            className={classeItem}
            onClick={aoFechar}
          >
            {item.icone}
            {item.rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/20 px-5 py-4">
        <p className="text-xs text-white/50">Plagard Systems</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">{conteudo}</aside>

      {/* Mobile overlay */}
      {aberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={aoFechar} />
          <aside className="relative z-50 h-full w-64">{conteudo}</aside>
        </div>
      )}
    </>
  );
}
