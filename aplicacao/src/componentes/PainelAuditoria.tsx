import { EstadoVazio } from './ui/EstadoVazio';
import type { LogAuditoria } from '../tipos/auditoria';

type PainelAuditoriaProps = {
  logs: LogAuditoria[];
};

const ROTULOS_ACAO: Record<string, string> = {
  'aluno.criado': 'Aluno cadastrado',
  'consulta.criada': 'Atendimento agendado',
  'consultoria.criada': 'Consultoria cadastrada',
  'curso.aula_criada': 'Aula adicionada ao curso',
  'curso.criado': 'Curso cadastrado',
  'curso.modulo_criado': 'Módulo adicionado ao curso',
  'paciente.criado': 'Paciente cadastrado',
  'profissional.perfil_atualizado': 'Perfil público atualizado',
};

const CORES_ACAO: Record<string, string> = {
  'aluno.criado': 'bg-teal-100 text-teal-600',
  'paciente.criado': 'bg-rose-100 text-rose-600',
  'consulta.criada': 'bg-amber-100 text-amber-600',
  'curso.criado': 'bg-blue-100 text-blue-600',
  'curso.modulo_criado': 'bg-blue-100 text-blue-600',
  'curso.aula_criada': 'bg-blue-100 text-blue-600',
  'consultoria.criada': 'bg-purple-100 text-purple-600',
  'profissional.perfil_atualizado': 'bg-slate-100 text-slate-600',
};

function IconeAcao({ acao }: { acao: string }) {
  const cor = CORES_ACAO[acao] ?? 'bg-slate-100 text-slate-500';
  return (
    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${cor}`}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export function PainelAuditoria({ logs }: PainelAuditoriaProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-slate-800">Auditoria</h2>
        <p className="mt-0.5 text-sm text-slate-500">Últimas ações registradas no painel.</p>
      </div>

      {logs.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma ação registrada"
          descricao="As ações do sistema aparecerão aqui conforme forem realizadas."
          icone={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {logs.map((log) => (
            <li key={log.id} className="flex items-start gap-4 px-6 py-4">
              <IconeAcao acao={log.acao} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{ROTULOS_ACAO[log.acao] ?? log.acao}</p>
                {log.entidade && (
                  <p className="mt-0.5 text-sm text-slate-500">{log.entidade}</p>
                )}
              </div>
              <time className="flex-shrink-0 text-xs text-slate-400">
                {new Date(log.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
