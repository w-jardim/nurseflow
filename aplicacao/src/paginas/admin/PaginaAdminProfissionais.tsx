import { useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import type { ListaPaginada, ProfissionalAdmin } from '../../tipos/admin';

const BADGE_PLANO: Record<string, string> = {
  GRATUITO: 'bg-slate-100 text-slate-600',
  PRO: 'bg-blue-100 text-blue-700',
  STANDARD: 'bg-teal-100 text-teal-700',
};

const BADGE_STATUS: Record<string, string> = {
  ATIVA: 'bg-emerald-100 text-emerald-700',
  INADIMPLENTE: 'bg-amber-100 text-amber-700',
  CANCELADA: 'bg-red-100 text-red-700',
  EXPIRADA: 'bg-slate-100 text-slate-600',
};

export function PaginaAdminProfissionais() {
  const [resultado, setResultado] = useState<ListaPaginada<ProfissionalAdmin> | null>(null);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    requisitarApi<ListaPaginada<ProfissionalAdmin>>(
      `/admin/profissionais?pagina=${pagina}&limite=20`,
      { autenticada: true },
    )
      .then(setResultado)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [pagina]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profissionais</h1>
        <p className="mt-1 text-sm text-slate-500">
          {resultado ? `${resultado.total} cadastros` : ''}
        </p>
      </div>

      {erro && <p className="text-red-600">{erro}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nome / Slug</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Alunos</th>
              <th className="px-4 py-3 text-center">Pacientes</th>
              <th className="px-4 py-3 text-center">Cursos</th>
              <th className="px-4 py-3">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {carregando
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              : resultado?.dados.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{p.nomePublico}</p>
                      <p className="text-xs text-slate-400">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.usuarioDono.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_PLANO[p.plano] ?? ''}`}>
                        {p.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_STATUS[p.statusAssinatura] ?? ''}`}>
                        {p.statusAssinatura}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{p._count.alunos}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{p._count.pacientes}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{p._count.cursos}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {resultado && resultado.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Página {resultado.pagina} de {resultado.totalPaginas}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={pagina === resultado.totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
