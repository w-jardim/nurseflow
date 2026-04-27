import { FormEvent, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Campo, CampoArea } from '../../componentes/ui/Campo';
import { Botao } from '../../componentes/ui/Botao';
import { requisitarApi } from '../../servicos/api';
import type { OutletContexto } from '../PaginaPublicaProfissional';
import { mascararTelefone } from '../../utilitarios/mascaras';

const HORARIOS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

const HOJE = new Date().toISOString().split('T')[0];

const GRADIENT = 'linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #047857 100%)';
const DOT_PATTERN = {
  backgroundImage:
    'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

export function PaginaPublicaAgendar() {
  const { pagina } = useOutletContext<OutletContexto>();
  const { slug } = useParams();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await requisitarApi(`/publico/profissionais/${pagina.slug}/agendamentos`, {
        metodo: 'POST',
        corpo: {
          nome,
          email,
          telefone: telefone || undefined,
          dataDesejada: data,
          horarioDesejado: horario || undefined,
          observacoes: observacoes || undefined,
        },
      });
      setNome(''); setEmail(''); setTelefone('');
      setData(''); setHorario(''); setObservacoes('');
      setEnviado(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível enviar a solicitação.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {/* Mini hero */}
      <section className="relative overflow-hidden py-14" style={{ background: GRADIENT }}>
        <div className="absolute inset-0 opacity-5" style={DOT_PATTERN} />
        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            to={`/${slug}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao perfil
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Agendar consulta</h1>
          <p className="mt-2 text-white/70">
            com {pagina.nomePublico}
            {pagina.conselho ? ` · ${pagina.conselho}` : ''}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Como funciona</h2>
            <p className="mt-3 text-slate-500">
              Preencha o formulário com sua preferência de data e horário. O profissional verificará a disponibilidade e confirmará seu agendamento.
            </p>

            <ul className="mt-8 space-y-5">
              {[
                { num: '1', titulo: 'Escolha data e horário', desc: 'Selecione sua preferência no formulário ao lado.' },
                { num: '2', titulo: 'Confirmação', desc: 'O profissional verificará e confirmará por e-mail.' },
                { num: '3', titulo: 'Consulta realizada', desc: 'Compareça no dia e horário confirmados.' },
              ].map((etapa) => (
                <li key={etapa.num} className="flex gap-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-primario">
                    {etapa.num}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{etapa.titulo}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{etapa.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {pagina.telefone && (
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Prefere ligar?</p>
                <a
                  href={`tel:${pagina.telefone}`}
                  className="mt-2 flex items-center gap-2 text-primario hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold">{pagina.telefone}</span>
                </a>
              </div>
            )}
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
            {enviado ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <svg className="h-8 w-8 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">Solicitação enviada!</h3>
                <p className="mt-2 text-sm text-slate-500">
                  O profissional verificará a disponibilidade e confirmará seu agendamento em breve.
                </p>
                <button
                  className="mt-6 text-sm font-semibold text-primario hover:underline"
                  onClick={() => setEnviado(false)}
                  type="button"
                >
                  Fazer outra solicitação
                </button>
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={enviar}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo rotulo="Nome" name="ag-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                  <Campo rotulo="E-mail" name="ag-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Campo
                  rotulo="Telefone (opcional)"
                  name="ag-telefone"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Data desejada"
                    name="ag-data"
                    type="date"
                    min={HOJE}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Horário preferido</span>
                    <select
                      className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      name="ag-horario"
                    >
                      <option value="">Qualquer horário</option>
                      {HORARIOS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <CampoArea
                  rotulo="Observações (opcional)"
                  name="ag-observacoes"
                  placeholder="Descreva o motivo da consulta ou informações relevantes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  maxLength={1000}
                />
                {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
                <Botao type="submit" carregando={enviando} larguraTotal>
                  {enviando ? 'Enviando...' : 'Solicitar agendamento'}
                </Botao>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
