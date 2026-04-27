import { FormEvent, useState } from 'react';
import { AgendaCalendario, type ItemAgenda } from './AgendaCalendario';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Consulta, StatusConsulta } from '../tipos/consultas';
import type { Consultoria } from '../tipos/consultorias';
import type { Contato } from '../tipos/contatos';
import { mascararTelefone } from '../utilitarios/mascaras';

type PainelConsultasProps = {
  pacientes: Contato[];
  consultas: Consulta[];
  consultorias: Consultoria[];
  aoCriar: (dados: {
    pacienteId: string;
    inicioEm: string;
    fimEm: string;
    status: StatusConsulta;
    observacoes: string;
    permitirSobreposicao: boolean;
  }) => Promise<void>;
};

const COR_STATUS: Record<StatusConsulta, 'ciano' | 'verde' | 'vermelho' | 'cinza'> = {
  AGENDADA: 'ciano',
  CONFIRMADA: 'verde',
  CANCELADA: 'vermelho',
  CONCLUIDA: 'cinza',
};

const ROTULO_STATUS: Record<StatusConsulta, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  CONCLUIDA: 'Concluída',
};

function formatarDataHora(valor: string) {
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function montarItensAgenda(consultas: Consulta[], consultorias: Consultoria[]): ItemAgenda[] {
  return [
    ...consultas.map((consulta) => ({
      id: consulta.id,
      tipo: 'consulta' as const,
      titulo: [consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' '),
      subtitulo: consulta.paciente.telefone ? mascararTelefone(consulta.paciente.telefone) : consulta.paciente.email,
      inicioEm: consulta.inicioEm,
      fimEm: consulta.fimEm,
      status: consulta.status,
    })),
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
  ];
}

export function PainelConsultas({ pacientes, consultas, consultorias, aoCriar }: PainelConsultasProps) {
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteId, setPacienteId] = useState('');
  const [inicioEm, setInicioEm] = useState('');
  const [fimEm, setFimEm] = useState('');
  const [status, setStatus] = useState<StatusConsulta>('AGENDADA');
  const [observacoes, setObservacoes] = useState('');
  const [permitirSobreposicao, setPermitirSobreposicao] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function limparFormulario() {
    setPacienteId('');
    setInicioEm('');
    setFimEm('');
    setStatus('AGENDADA');
    setObservacoes('');
    setPermitirSobreposicao(false);
  }

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      await aoCriar({ pacienteId, inicioEm, fimEm, status, observacoes, permitirSobreposicao });
      limparFormulario();
      setModalAberto(false);
      toast('Agendamento criado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  const itensAgenda = montarItensAgenda(consultas, consultorias);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Agenda de consultas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visualize atendimentos e evite conflitos de horário antes de confirmar.
          </p>
        </div>
        <Botao onClick={() => setModalAberto(true)} disabled={pacientes.length === 0}>
          Novo agendamento
        </Botao>
      </div>

      <AgendaCalendario
        itens={itensAgenda}
        titulo="Calendário"
        descricao="Consultas e consultorias agendadas na mesma linha do tempo."
        acao={{ rotulo: 'Novo agendamento', aoClicar: () => setModalAberto(true) }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {consultas.length} atendimento{consultas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {consultas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum atendimento agendado"
            descricao="Cadastre pacientes e use o botão de novo agendamento."
            acaoRotulo="Agendar consulta"
            aoAcionar={() => setModalAberto(true)}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {consultas.map((consulta) => (
              <li key={consulta.id} className="px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {[consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' ')}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatarDataHora(consulta.inicioEm)} até {formatarDataHora(consulta.fimEm)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[
                        consulta.paciente.email,
                        consulta.paciente.telefone ? mascararTelefone(consulta.paciente.telefone) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Sem contato'}
                    </p>
                  </div>
                  <Badge cor={COR_STATUS[consulta.status]}>{ROTULO_STATUS[consulta.status]}</Badge>
                </div>
                {consulta.observacoes ? <p className="mt-2 text-sm text-slate-500">{consulta.observacoes}</p> : null}
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
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">Novo agendamento</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Agendar consulta</h3>
                <p className="mt-1 text-sm text-slate-500">A agenda bloqueia horários sobrepostos por padrão.</p>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoSelect rotulo="Paciente" value={pacienteId} onChange={setPacienteId} required>
                  <option value="">Selecione</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {[paciente.nome, paciente.sobrenome].filter(Boolean).join(' ')}
                    </option>
                  ))}
                </CampoSelect>

                <CampoSelect rotulo="Status" value={status} onChange={(valor) => setStatus(valor as StatusConsulta)}>
                  <option value="AGENDADA">Agendada</option>
                  <option value="CONFIRMADA">Confirmada</option>
                </CampoSelect>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  rotulo="Início"
                  name="consulta-inicio"
                  type="datetime-local"
                  value={inicioEm}
                  onChange={(evento) => setInicioEm(evento.target.value)}
                  required
                />
                <Campo
                  rotulo="Fim"
                  name="consulta-fim"
                  type="datetime-local"
                  value={fimEm}
                  onChange={(evento) => setFimEm(evento.target.value)}
                  required
                />
              </div>

              <CampoArea
                rotulo="Observações administrativas"
                name="consulta-observacoes"
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
                    Use somente quando este atendimento puder acontecer no mesmo horário de outro serviço.
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
                  {enviando ? 'Salvando...' : 'Salvar agendamento'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
