import { useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import type { MetricasAdmin } from '../../tipos/admin';
import { formatarReais } from '../../utilitarios/moeda';

function CardMetrica({ rotulo, valor, sub }: { rotulo: string; valor: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{rotulo}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{valor}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function BarraPlano({ rotulo, valor, total, cor }: { rotulo: string; valor: number; total: number; cor: string }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{rotulo}</span>
        <span className="text-slate-500">{valor} ({pct}%)</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function PaginaAdminMetricas() {
  const [metricas, setMetricas] = useState<MetricasAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<MetricasAdmin>('/admin/metricas', { autenticada: true })
      .then(setMetricas)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (erro) return <p className="text-red-600">{erro}</p>;
  if (!metricas) return null;

  const totalPlanos =
    metricas.profissionais.porPlano.GRATUITO +
    metricas.profissionais.porPlano.PRO +
    metricas.profissionais.porPlano.STANDARD;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Métricas da Plataforma</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral em tempo real</p>
      </div>

      {/* Receita */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Receita</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetrica
            rotulo="MRR"
            valor={formatarReais(metricas.receita.mrrCentavos)}
            sub="Receita mensal recorrente"
          />
          <CardMetrica
            rotulo="ARR"
            valor={formatarReais(metricas.receita.arrCentavos)}
            sub="Receita anual recorrente"
          />
          <CardMetrica
            rotulo="Profissionais pagos"
            valor={String(metricas.profissionais.porPlano.PRO + metricas.profissionais.porPlano.STANDARD)}
            sub="Planos Pro e Standard"
          />
          <CardMetrica
            rotulo="Ticket SaaS médio"
            valor={formatarReais(
              metricas.profissionais.porPlano.PRO + metricas.profissionais.porPlano.STANDARD > 0
                ? Math.round(
                    metricas.receita.mrrCentavos /
                      (metricas.profissionais.porPlano.PRO + metricas.profissionais.porPlano.STANDARD),
                  )
                : 0,
            )}
            sub="Sem comissão sobre cursos"
          />
        </div>
      </div>

      {/* Assinaturas */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Assinaturas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetrica
            rotulo="Churn (30 dias)"
            valor={`${metricas.assinaturas.churnRate30Dias}%`}
            sub={`${metricas.assinaturas.canceladas30Dias} cancelamentos`}
          />
          <CardMetrica
            rotulo="Novos (mês atual)"
            valor={String(metricas.profissionais.novosMesAtual)}
            sub="Profissionais cadastrados"
          />
          <CardMetrica
            rotulo="Total alunos"
            valor={String(metricas.usuarios.totalAlunos)}
          />
          <CardMetrica
            rotulo="Total pacientes"
            valor={String(metricas.usuarios.totalPacientes)}
          />
        </div>
      </div>

      {/* Distribuição por plano */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Distribuição por plano — {metricas.profissionais.total} profissionais
        </h2>
        <div className="space-y-4">
          <BarraPlano rotulo="Gratuito" valor={metricas.profissionais.porPlano.GRATUITO} total={totalPlanos} cor="bg-slate-400" />
          <BarraPlano rotulo="PRO" valor={metricas.profissionais.porPlano.PRO} total={totalPlanos} cor="bg-destaque" />
          <BarraPlano rotulo="Standard" valor={metricas.profissionais.porPlano.STANDARD} total={totalPlanos} cor="bg-primario" />
        </div>
      </div>
    </div>
  );
}
