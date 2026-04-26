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

function descreverAcao(acao: string) {
  return ROTULOS_ACAO[acao] ?? acao;
}

export function PainelAuditoria({ logs }: PainelAuditoriaProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Auditoria</h2>
        <p className="mt-1 text-sm text-slate-600">Últimas ações registradas no painel.</p>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma ação registrada.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="rounded-md bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{descreverAcao(log.acao)}</p>
                    {log.entidade ? <p className="mt-1 text-sm text-slate-600">{log.entidade}</p> : null}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(log.criadoEm).toLocaleString('pt-BR')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
