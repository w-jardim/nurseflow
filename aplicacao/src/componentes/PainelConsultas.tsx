import { FormEvent, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Consulta, StatusConsulta } from '../tipos/consultas';
import type { Contato } from '../tipos/contatos';
import { mascararTelefone } from '../utilitarios/mascaras';

type PainelConsultasProps = {
  pacientes: Contato[];
  consultas: Consulta[];
  aoCriar: (dados: {
    pacienteId: string;
    inicioEm: string;
    fimEm: string;
    status: StatusConsulta;
    observacoes: string;
  }) => Promise<void>;
};

function formatarDataHora(valor: string) {
  return new Date(valor).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function rotuloStatus(status: StatusConsulta) {
  const rotulos: Record<StatusConsulta, string> = {
    AGENDADA: 'Agendada',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    CONCLUIDA: 'Concluída',
  };

  return rotulos[status];
}

export function PainelConsultas({ pacientes, consultas, aoCriar }: PainelConsultasProps) {
  const [pacienteId, setPacienteId] = useState('');
  const [inicioEm, setInicioEm] = useState('');
  const [fimEm, setFimEm] = useState('');
  const [status, setStatus] = useState<StatusConsulta>('AGENDADA');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await aoCriar({
        pacienteId,
        inicioEm,
        fimEm,
        status,
        observacoes,
      });
      setPacienteId('');
      setInicioEm('');
      setFimEm('');
      setStatus('AGENDADA');
      setObservacoes('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Agenda</h2>
        <p className="mt-1 text-sm text-slate-600">Organize atendimentos com pacientes cadastrados.</p>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={criar}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Paciente</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={pacienteId}
              onChange={(evento) => setPacienteId(evento.target.value)}
              required
            >
              <option value="">Selecione</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {[paciente.nome, paciente.sobrenome].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Status</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={status}
              onChange={(evento) => setStatus(evento.target.value as StatusConsulta)}
            >
              <option value="AGENDADA">Agendada</option>
              <option value="CONFIRMADA">Confirmada</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Início"
            name="consulta-inicio"
            type="datetime-local"
            value={inicioEm}
            onChange={(evento) => setInicioEm(evento.target.value)}
            required
          />
          <CampoTexto
            rotulo="Fim"
            name="consulta-fim"
            type="datetime-local"
            value={fimEm}
            onChange={(evento) => setFimEm(evento.target.value)}
            required
          />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Observações administrativas</span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
            value={observacoes}
            onChange={(evento) => setObservacoes(evento.target.value)}
            maxLength={1000}
          />
        </label>

        {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

        <button
          className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviando}
          type="submit"
        >
          {enviando ? 'Salvando...' : 'Adicionar agendamento'}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {consultas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum atendimento agendado.</p>
        ) : (
          <ul className="space-y-3">
            {consultas.map((consulta) => (
              <li key={consulta.id} className="rounded-md bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {[consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' ')}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatarDataHora(consulta.inicioEm)} até {formatarDataHora(consulta.fimEm)}
                    </p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {rotuloStatus(consulta.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {[consulta.paciente.email, consulta.paciente.telefone ? mascararTelefone(consulta.paciente.telefone) : null]
                    .filter(Boolean)
                    .join(' · ') || 'Sem contato informado'}
                </p>
                {consulta.observacoes ? (
                  <p className="mt-2 text-sm text-slate-600">{consulta.observacoes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
