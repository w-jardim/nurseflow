import { useSessao } from '../../contextos/SessaoContexto';

const ROTULO_PAPEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  PROFISSIONAL: 'Profissional',
  ALUNO: 'Aluno',
  PACIENTE: 'Paciente',
};

type Props = { aoAbrirMenu: () => void };

export function Header({ aoAbrirMenu }: Props) {
  const { usuario, sair } = useSessao();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={aoAbrirMenu}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{usuario?.nome}</p>
          <p className="text-xs text-slate-500">{ROTULO_PAPEL[usuario?.papel ?? ''] ?? usuario?.papel}</p>
        </div>
        <button
          onClick={sair}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
