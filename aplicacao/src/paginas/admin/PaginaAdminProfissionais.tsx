import { useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import { Badge } from '../../componentes/ui/Badge';
import { Botao } from '../../componentes/ui/Botao';
import { Esqueleto } from '../../componentes/ui/Esqueleto';
import type { ListaPaginada, ProfissionalAdmin } from '../../tipos/admin';

const COR_PLANO: Record<string, 'cinza' | 'azul' | 'ciano'> = {
  GRATUITO: 'cinza',
  PRO: 'azul',
  STANDARD: 'ciano',
};

const COR_STATUS: Record<string, 'verde' | 'amarelo' | 'vermelho' | 'cinza'> = {
  ATIVA: 'verde',
  INADIMPLENTE: 'amarelo',
  CANCELADA: 'vermelho',
  EXPIRADA: 'cinza',
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
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Profissionais</h1>
        {resultado && (
          <p className="mt-1 text-sm text-slate-400">{resultado.total} cadastros</p>
        )}
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nome / Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Plano
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Alunos
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Pacientes
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cursos
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cadastro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregando
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <Esqueleto className="h-4" />
                      </td>
                    </tr>
                  ))
                : resultado?.dados.map((p) => (
                    <tr key={p.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.nomePublico}</p>
                        <p className="text-xs text-slate-400">/{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.usuarioDono.email}</td>
                      <td className="px-4 py-3">
                        <Badge cor={COR_PLANO[p.plano] ?? 'cinza'}>{p.plano}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge cor={COR_STATUS[p.statusAssinatura] ?? 'cinza'}>
                          {p.statusAssinatura}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500">{p._count.alunos}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{p._count.pacientes}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{p._count.cursos}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {resultado && resultado.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Página {resultado.pagina} de {resultado.totalPaginas}
          </p>
          <div className="flex gap-2">
            <Botao
              variante="contorno"
              tamanho="sm"
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </Botao>
            <Botao
              variante="contorno"
              tamanho="sm"
              disabled={pagina === resultado.totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </Botao>
          </div>
        </div>
      )}
    </div>
  );
}
