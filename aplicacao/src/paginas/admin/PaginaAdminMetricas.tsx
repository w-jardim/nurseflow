import { useEffect, useState } from 'react';
import { requisitarApi } from '../../servicos/api';
import { CartaoEsqueleto } from '../../componentes/ui/Esqueleto';
import type { MetricasAdmin } from '../../tipos/admin';
import { formatarReais } from '../../utilitarios/moeda';

function CardMetrica({
  rotulo,
  valor,
  sub,
  cor = 'bg-slate-50 text-slate-600',
}: {
  rotulo: string;
  valor: string;
  sub?: string;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{rotulo}</p>
      <p className={`mt-1.5 text-2xl font-bold ${cor}`}>{valor}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function BarraPlano({
  rotulo,
  valor,
  total,
  cor,
}: {
  rotulo: string;
  valor: number;
  total: number;
  cor: string;
}) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{rotulo}</span>
        <span className="text-slate-400">
          {valor} <span className="text-slate-300">·</span> {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cor}`}
          style={{ width: `${pct}%` }}
        />
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
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <CartaoEsqueleto key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>
    );
  }

  if (!metricas) return null;

  const totalPlanos =
    metricas.profissionais.porPlano.GRATUITO +
    metricas.profissionais.porPlano.PRO +
    metricas.profissionais.porPlano.STANDARD;

  const pagos = metricas.profissionais.porPlano.PRO + metricas.profissionais.porPlano.STANDARD;
  const ticketMedio = pagos > 0 ? Math.round(metricas.receita.mrrCentavos / pagos) : 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Métricas da Plataforma</h1>
        <p className="mt-1 text-sm text-slate-400">Visão geral em tempo real</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Receita</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetrica
            rotulo="MRR"
            valor={formatarReais(metricas.receita.mrrCentavos)}
            sub="Receita mensal recorrente"
            cor="text-primario"
          />
          <CardMetrica
            rotulo="ARR"
            valor={formatarReais(metricas.receita.arrCentavos)}
            sub="Receita anual recorrente"
            cor="text-primario"
          />
          <CardMetrica
            rotulo="Profissionais pagos"
            valor={String(pagos)}
            sub="Planos Pro e Standard"
          />
          <CardMetrica
            rotulo="Ticket SaaS médio"
            valor={formatarReais(ticketMedio)}
            sub="Sem comissão sobre cursos"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Assinaturas e usuários</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardMetrica
            rotulo="Churn (30 dias)"
            valor={`${metricas.assinaturas.churnRate30Dias}%`}
            sub={`${metricas.assinaturas.canceladas30Dias} cancelamentos`}
            cor={metricas.assinaturas.churnRate30Dias > 5 ? 'text-red-600' : 'text-slate-800'}
          />
          <CardMetrica
            rotulo="Novos (mês atual)"
            valor={String(metricas.profissionais.novosMesAtual)}
            sub="Profissionais cadastrados"
            cor="text-slate-800"
          />
          <CardMetrica rotulo="Total alunos" valor={String(metricas.usuarios.totalAlunos)} />
          <CardMetrica rotulo="Total pacientes" valor={String(metricas.usuarios.totalPacientes)} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Distribuição por plano — {metricas.profissionais.total} profissionais
        </p>
        <div className="space-y-4">
          <BarraPlano
            rotulo="Gratuito"
            valor={metricas.profissionais.porPlano.GRATUITO}
            total={totalPlanos}
            cor="bg-slate-400"
          />
          <BarraPlano
            rotulo="PRO"
            valor={metricas.profissionais.porPlano.PRO}
            total={totalPlanos}
            cor="bg-blue-500"
          />
          <BarraPlano
            rotulo="Standard"
            valor={metricas.profissionais.porPlano.STANDARD}
            total={totalPlanos}
            cor="bg-primario"
          />
        </div>
      </div>
    </div>
  );
}
