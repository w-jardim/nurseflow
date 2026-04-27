import { FormEvent, useState } from 'react';
import { Campo } from './ui/Campo';
import { CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
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
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

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

export function PainelConsultas({ pacientes, consultas, aoCriar }: PainelConsultasProps) {
  const toast = useToast();
  const [pacienteId, setPacienteId] = useState('');
  const [inicioEm, setInicioEm] = useState('');
  const [fimEm, setFimEm] = useState('');
  const [status, setStatus] = useState<StatusConsulta>('AGENDADA');
  const [observacoes, setObservacoes] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      await aoCriar({ pacienteId, inicioEm, fimEm, status, observacoes });
      setPacienteId('');
      setInicioEm('');
      setFimEm('');
      setStatus('AGENDADA');
      setObservacoes('');
      toast('Agendamento criado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o agendamento.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">Novo agendamento</h2>
          <p className="mt-0.5 text-sm text-slate-500">Organize atendimentos com pacientes cadastrados.</p>
        </div>

        <form className="grid gap-4" onSubmit={criar}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect
              rotulo="Paciente"
              value={pacienteId}
              onChange={setPacienteId}
              required
            >
              <option value="">Selecione</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {[p.nome, p.sobrenome].filter(Boolean).join(' ')}
                </option>
              ))}
            </CampoSelect>

            <CampoSelect rotulo="Status" value={status} onChange={(v) => setStatus(v as StatusConsulta)}>
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
              onChange={(e) => setInicioEm(e.target.value)}
              required
            />
            <Campo
              rotulo="Fim"
              name="consulta-fim"
              type="datetime-local"
              value={fimEm}
              onChange={(e) => setFimEm(e.target.value)}
              required
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Observações administrativas</span>
            <textarea
              className="mt-1.5 min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={1000}
            />
          </label>

          <Botao type="submit" carregando={enviando} disabled={pacientes.length === 0}>
            {enviando ? 'Salvando...' : 'Adicionar agendamento'}
          </Botao>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {consultas.length} atendimento{consultas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {consultas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum atendimento agendado"
            descricao="Cadastre pacientes e use o formulário acima para agendar."
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
                    <p className="font-medium text-slate-800">
                      {[consulta.paciente.nome, consulta.paciente.sobrenome].filter(Boolean).join(' ')}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatarDataHora(consulta.inicioEm)} → {formatarDataHora(consulta.fimEm)}
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
                {consulta.observacoes && (
                  <p className="mt-2 text-sm text-slate-500">{consulta.observacoes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
