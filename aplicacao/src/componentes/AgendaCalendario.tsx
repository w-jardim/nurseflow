import { Link } from 'react-router-dom';
import { Badge } from './ui/Badge';

export type ItemAgenda = {
  id: string;
  tipo: 'consulta' | 'consultoria';
  titulo: string;
  subtitulo?: string | null;
  inicioEm: string;
  fimEm: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';
  para?: string;
};

const STATUS_COR = {
  AGENDADA: 'ciano',
  CONFIRMADA: 'verde',
  CANCELADA: 'vermelho',
  CONCLUIDA: 'cinza',
} as const;

const STATUS_ROTULO = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
};

const TIPO_ROTULO = {
  consulta: 'Consulta',
  consultoria: 'Consultoria',
};

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setDate(data.getDate() + dias);
  return novaData;
}

function mesmaData(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatarHora(valor: string) {
  return new Date(valor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function ordenarAgenda(itens: ItemAgenda[]) {
  return [...itens].sort((a, b) => a.inicioEm.localeCompare(b.inicioEm));
}

type AgendaCalendarioProps = {
  itens: ItemAgenda[];
  titulo?: string;
  descricao?: string;
  compacto?: boolean;
  acao?: {
    rotulo: string;
    aoClicar?: () => void;
    para?: string;
  };
};

export function AgendaCalendario({ itens, titulo = 'Agenda', descricao, compacto = false, acao }: AgendaCalendarioProps) {
  const hoje = inicioDoDia(new Date());
  const dias = Array.from({ length: compacto ? 5 : 7 }, (_, indice) => adicionarDias(hoje, indice));
  const itensOrdenados = ordenarAgenda(itens);
  const proximosItens = itensOrdenados
    .filter((item) => new Date(item.fimEm) >= hoje && item.status !== 'CANCELADA')
    .slice(0, compacto ? 4 : 8);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primario">{titulo}</p>
          {descricao ? <p className="mt-1 text-sm text-slate-500">{descricao}</p> : null}
        </div>
        {acao ? (
          acao.para ? (
            <Link
              to={acao.para}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primario px-3 text-sm font-semibold text-white transition hover:bg-primario-800"
            >
              {acao.rotulo}
            </Link>
          ) : (
            <button
              type="button"
              onClick={acao.aoClicar}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primario px-3 text-sm font-semibold text-white transition hover:bg-primario-800"
            >
              {acao.rotulo}
            </button>
          )
        ) : null}
      </div>

      <div className={`grid ${compacto ? 'gap-4 p-4 lg:grid-cols-[1fr_1.1fr]' : 'gap-5 p-5 xl:grid-cols-[1.1fr_1fr]'}`}>
        <div className="grid grid-cols-5 gap-2 md:grid-cols-7">
          {dias.map((dia) => {
            const itensDoDia = itensOrdenados.filter((item) => mesmaData(new Date(item.inicioEm), dia));
            return (
              <div
                key={dia.toISOString()}
                className={[
                  'min-h-28 rounded-xl border px-2 py-2',
                  mesmaData(dia, hoje) ? 'border-primario bg-teal-50' : 'border-slate-200 bg-slate-50',
                ].join(' ')}
              >
                <p className="text-xs font-semibold uppercase text-slate-500">
                  {dia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </p>
                <p className="text-lg font-bold text-slate-900">{dia.getDate()}</p>
                <div className="mt-2 space-y-1">
                  {itensDoDia.slice(0, 3).map((item) => (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      className={[
                        'truncate rounded-md px-2 py-1 text-[11px] font-semibold',
                        item.tipo === 'consulta' ? 'bg-white text-teal-700' : 'bg-blue-50 text-blue-700',
                      ].join(' ')}
                      title={item.titulo}
                    >
                      {formatarHora(item.inicioEm)} {item.titulo}
                    </div>
                  ))}
                  {itensDoDia.length > 3 ? (
                    <p className="text-[11px] font-medium text-slate-500">+{itensDoDia.length - 3}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Próximos horários</p>
          </div>
          {proximosItens.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">Nenhum horário agendado para os próximos dias.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {proximosItens.map((item) => (
                <li key={`${item.tipo}-${item.id}`} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {TIPO_ROTULO[item.tipo]} · {formatarHora(item.inicioEm)} às {formatarHora(item.fimEm)}
                    </p>
                    {item.subtitulo ? <p className="mt-0.5 truncate text-xs text-slate-400">{item.subtitulo}</p> : null}
                  </div>
                  <Badge cor={STATUS_COR[item.status]}>{STATUS_ROTULO[item.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
