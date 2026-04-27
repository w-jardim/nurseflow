import { FormEvent, useState } from 'react';
import { AgendaCalendario, type ItemAgenda } from './AgendaCalendario';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Consulta } from '../tipos/consultas';
import type { Consultoria, ModalidadeConsultoria, StatusConsultoria } from '../tipos/consultorias';
import { formatarReais, mascararReais, reaisParaCentavos } from '../utilitarios/moeda';

const PRECO_MAXIMO_CENTAVOS = 100000000;

type PainelConsultoriasProps = {
  consultorias: Consultoria[];
  consultas: Consulta[];
  aoCriar: (dados: {
    titulo: string;
    descricao: string;
    modalidade: ModalidadeConsultoria;
    precoCentavos: number;
    inicioEm: string;
    fimEm: string;
    status: StatusConsultoria;
    observacoes: string;
    permitirSobreposicao: boolean;
  }) => Promise<void>;
};

const COR_STATUS: Record<StatusConsultoria, 'ciano' | 'verde' | 'vermelho' | 'cinza'> = {
  AGENDADA: 'ciano',
  CONFIRMADA: 'verde',
  CANCELADA: 'vermelho',
  CONCLUIDA: 'cinza',
};

const ROTULO_STATUS: Record<StatusConsultoria, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
};

function formatarDataHora(valor: string | null) {
  if (!valor) return 'Sem horário';
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function montarItensAgenda(consultorias: Consultoria[], consultas: Consulta[]): ItemAgenda[] {
  return [
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
      })),
    ...consultas.map((consulta) => ({
      id: consulta.id,
      tipo: 'consulta' as const,
      titulo: [consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' '),
      subtitulo: 'Consulta',
      inicioEm: consulta.inicioEm,
      fimEm: consulta.fimEm,
      status: consulta.status,
    })),
  ];
}

export function PainelConsultorias({ consultorias, consultas, aoCriar }: PainelConsultoriasProps) {
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeConsultoria>('ONLINE');
  const [preco, setPreco] = useState('');
  const [inicioEm, setInicioEm] = useState('');
  const [fimEm, setFimEm] = useState('');
  const [status, setStatus] = useState<StatusConsultoria>('AGENDADA');
  const [observacoes, setObservacoes] = useState('');
  const [permitirSobreposicao, setPermitirSobreposicao] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function limparFormulario() {
    setTitulo('');
    setDescricao('');
    setModalidade('ONLINE');
    setPreco('');
    setInicioEm('');
    setFimEm('');
    setStatus('AGENDADA');
    setObservacoes('');
    setPermitirSobreposicao(false);
  }

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const precoCentavos = reaisParaCentavos(preco);

    if (precoCentavos > PRECO_MAXIMO_CENTAVOS) {
      toast(`Preço máximo: ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`, 'aviso');
      return;
    }

    setEnviando(true);

    try {
      await aoCriar({
        titulo,
        descricao,
        modalidade,
        precoCentavos,
        inicioEm,
        fimEm,
        status,
        observacoes,
        permitirSobreposicao,
      });
      limparFormulario();
      setModalAberto(false);
      toast('Consultoria cadastrada com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  const itensAgenda = montarItensAgenda(consultorias, consultas);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Agenda de consultorias</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre serviços avulsos com preço, modalidade e horário reservado.
          </p>
        </div>
        <Botao onClick={() => setModalAberto(true)}>Nova consultoria</Botao>
      </div>

      <AgendaCalendario
        itens={itensAgenda}
        titulo="Calendário"
        descricao="Consultorias dividem agenda com consultas para evitar sobreposição."
        acao={{ rotulo: 'Nova consultoria', aoClicar: () => setModalAberto(true) }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {consultorias.length} consultoria{consultorias.length !== 1 ? 's' : ''}
          </p>
        </div>

        {consultorias.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma consultoria cadastrada"
            descricao="Use o botão de nova consultoria para criar um serviço agendável."
            acaoRotulo="Nova consultoria"
            aoAcionar={() => setModalAberto(true)}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {consultorias.map((consultoria) => (
              <li key={consultoria.id} className="px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{consultoria.titulo}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatarDataHora(consultoria.inicioEm)}
                      {consultoria.fimEm ? ` até ${formatarDataHora(consultoria.fimEm)}` : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge cor={consultoria.modalidade === 'ONLINE' ? 'azul' : 'ciano'}>
                        {consultoria.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                      </Badge>
                      <Badge cor={COR_STATUS[consultoria.status]}>{ROTULO_STATUS[consultoria.status]}</Badge>
                    </div>
                  </div>
                  <span className="rounded-xl bg-teal-50 px-3 py-1 text-sm font-semibold text-primario">
                    {formatarReais(consultoria.precoCentavos)}
                  </span>
                </div>
                {consultoria.descricao ? <p className="mt-2 text-sm text-slate-500">{consultoria.descricao}</p> : null}
                {consultoria.observacoes ? (
                  <p className="mt-1 text-xs text-slate-400">{consultoria.observacoes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalAberto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">Nova consultoria</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Criar serviço agendável</h3>
                <p className="mt-1 text-sm text-slate-500">Valor, modalidade e horário ficam no mesmo fluxo.</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  setModalAberto(false);
                  limparFormulario();
                }}
                type="button"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </div>

            <form className="grid gap-4 px-6 py-5" onSubmit={criar}>
              <Campo
                rotulo="Título"
                name="consultoria-titulo"
                placeholder="Ex.: Consultoria Nutricional Individual"
                value={titulo}
                onChange={(evento) => setTitulo(evento.target.value)}
                required
              />
              <CampoArea
                rotulo="Descrição"
                name="consultoria-descricao"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
                maxLength={2000}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <CampoSelect rotulo="Modalidade" value={modalidade} onChange={(valor) => setModalidade(valor as ModalidadeConsultoria)}>
                  <option value="ONLINE">Online</option>
                  <option value="PRESENCIAL">Presencial</option>
                </CampoSelect>
                <Campo
                  rotulo="Valor"
                  name="consultoria-preco"
                  placeholder="0,00"
                  inputMode="numeric"
                  value={preco}
                  onChange={(evento) => setPreco(mascararReais(evento.target.value))}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Campo
                  rotulo="Início"
                  name="consultoria-inicio"
                  type="datetime-local"
                  value={inicioEm}
                  onChange={(evento) => setInicioEm(evento.target.value)}
                  required
                />
                <Campo
                  rotulo="Fim"
                  name="consultoria-fim"
                  type="datetime-local"
                  value={fimEm}
                  onChange={(evento) => setFimEm(evento.target.value)}
                  required
                />
                <CampoSelect rotulo="Status" value={status} onChange={(valor) => setStatus(valor as StatusConsultoria)}>
                  <option value="AGENDADA">Agendada</option>
                  <option value="CONFIRMADA">Confirmada</option>
                </CampoSelect>
              </div>

              <CampoArea
                rotulo="Observações administrativas"
                name="consultoria-observacoes"
                value={observacoes}
                onChange={(evento) => setObservacoes(evento.target.value)}
                maxLength={1000}
              />

              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-amber-300 text-primario focus:ring-teal-100"
                  checked={permitirSobreposicao}
                  onChange={(evento) => setPermitirSobreposicao(evento.target.checked)}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Autorizar sobreposição</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Marque apenas quando essa consultoria puder acontecer junto de outro serviço.
                  </span>
                </span>
              </label>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Botao
                  type="button"
                  variante="fantasma"
                  onClick={() => {
                    setModalAberto(false);
                    limparFormulario();
                  }}
                >
                  Cancelar
                </Botao>
                <Botao type="submit" carregando={enviando}>
                  {enviando ? 'Salvando...' : 'Salvar consultoria'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
