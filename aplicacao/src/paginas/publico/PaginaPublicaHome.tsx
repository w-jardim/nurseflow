import { FormEvent, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Campo, CampoArea } from '../../componentes/ui/Campo';
import { Botao } from '../../componentes/ui/Botao';
import { requisitarApi } from '../../servicos/api';
import type { OutletContexto } from '../PaginaPublicaProfissional';
import { formatarReais } from '../../utilitarios/moeda';
import { mascararTelefone } from '../../utilitarios/mascaras';

const GRADIENT = 'linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #047857 100%)';
const DOT_PATTERN = {
  backgroundImage:
    'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

type CategoriaTile = {
  id: string;
  rotulo: string;
  para: string;
  cor: string;
  corTexto: string;
  icone: string;
  count: number;
  precoMin: number;
  precoMax: number;
  previews: string[];
};

export function PaginaPublicaHome() {
  const { pagina } = useOutletContext<OutletContexto>();
  const { slug } = useParams();
  const contatoRef = useRef<HTMLDivElement>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviarContato(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await requisitarApi(`/publico/profissionais/${pagina.slug}/interesses`, {
        metodo: 'POST',
        corpo: {
          nome,
          email,
          telefone: telefone || undefined,
          mensagem: mensagem || undefined,
          origem: 'PERFIL',
        },
      });
      setNome(''); setEmail(''); setTelefone(''); setMensagem('');
      setEnviado(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível enviar.');
    } finally {
      setEnviando(false);
    }
  }

  const tiles: CategoriaTile[] = [
    pagina.cursos.length > 0 && {
      id: 'cursos',
      rotulo: 'Cursos',
      para: `/${slug}/cursos`,
      cor: 'bg-blue-50 border-blue-100',
      corTexto: 'text-blue-600',
      icone: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      count: pagina.cursos.length,
      precoMin: Math.min(...pagina.cursos.map((c) => c.precoCentavos)),
      precoMax: Math.max(...pagina.cursos.map((c) => c.precoCentavos)),
      previews: pagina.cursos.slice(0, 3).map((c) => c.titulo),
    },
    pagina.servicos.length > 0 && {
      id: 'servicos',
      rotulo: 'Serviços',
      para: `/${slug}/servicos`,
      cor: 'bg-emerald-50 border-emerald-100',
      corTexto: 'text-emerald-600',
      icone: 'M9 6h6m-6 4h6m-6 4h3m-7 6h14a2 2 0 002-2V6.5L16.5 2H5a2 2 0 00-2 2v14a2 2 0 002 2z',
      count: pagina.servicos.length,
      precoMin: Math.min(...pagina.servicos.filter((s) => s.exibirPreco).map((s) => s.precoCentavos)),
      precoMax: Math.max(...pagina.servicos.filter((s) => s.exibirPreco).map((s) => s.precoCentavos)),
      previews: pagina.servicos.slice(0, 3).map((s) => s.titulo),
    },
    pagina.consultorias.length > 0 && {
      id: 'consultorias',
      rotulo: 'Consultorias',
      para: `/${slug}/consultorias`,
      cor: 'bg-purple-50 border-purple-100',
      corTexto: 'text-purple-600',
      icone: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      count: pagina.consultorias.length,
      precoMin: Math.min(...pagina.consultorias.map((c) => c.precoCentavos)),
      precoMax: Math.max(...pagina.consultorias.map((c) => c.precoCentavos)),
      previews: pagina.consultorias.slice(0, 3).map((c) => c.titulo),
    },
  ].filter(Boolean) as CategoriaTile[];

  const temPagamento = !!(pagina.pixChave || pagina.linkPagamento || pagina.instrucoesPagamento);
  const temServicos = tiles.length > 0;

  const avatarLetras = pagina.nomePublico
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute inset-0 opacity-5" style={DOT_PATTERN} />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold text-white backdrop-blur-sm md:h-28 md:w-28 md:text-4xl">
              {avatarLetras}
            </div>
            <div className="flex-1">
              {pagina.conselho && (
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                  {pagina.conselho}
                </span>
              )}
              <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">{pagina.nomePublico}</h1>
              {pagina.bio && (
                <p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">{pagina.bio}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {temServicos && (
                  <button
                    onClick={() => document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth' })}
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
                    type="button"
                  >
                    Ver serviços
                  </button>
                )}
                <button
                  onClick={() => contatoRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  type="button"
                >
                  Entrar em contato
                </button>
                {pagina.telefone && (
                  <a
                    href={`tel:${pagina.telefone}`}
                    className="flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {mascararTelefone(pagina.telefone)}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      {temServicos && (
        <section id="vitrine" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primario">O que ofereço</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Escolha uma categoria</h2>
            <p className="mt-3 text-sm text-slate-500">Acesse a vitrine completa de cada serviço.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile) => {
              const temPrecos = isFinite(tile.precoMin) && tile.precoMin > 0;
              return (
                <Link
                  key={tile.id}
                  to={tile.para}
                  className={`group flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-card-hover ${tile.cor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ${tile.corTexto}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={tile.icone} />
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold ${tile.corTexto}`}>
                      {tile.count} {tile.rotulo.toLowerCase()}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">{tile.rotulo}</h3>

                  {temPrecos && (
                    <p className="mt-1 text-sm text-slate-500">
                      {tile.precoMin === tile.precoMax
                        ? formatarReais(tile.precoMin)
                        : `${formatarReais(tile.precoMin)} – ${formatarReais(tile.precoMax)}`}
                    </p>
                  )}

                  <ul className="mt-4 flex-1 space-y-1.5">
                    {tile.previews.map((titulo) => (
                      <li key={titulo} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${tile.corTexto.replace('text-', 'bg-')}`} />
                        <span className="truncate">{titulo}</span>
                      </li>
                    ))}
                    {tile.count > 3 && (
                      <li className="text-xs text-slate-400">+ {tile.count - 3} mais</li>
                    )}
                  </ul>

                  <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold ${tile.corTexto} group-hover:gap-2.5 transition-all`}>
                    Ver vitrine completa
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Booking CTA */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primario/20 bg-teal-50 p-6 sm:flex-row">
            <div>
              <h3 className="font-semibold text-teal-900">Quer agendar uma consulta?</h3>
              <p className="mt-0.5 text-sm text-teal-700">Escolha uma data e horário de sua preferência.</p>
            </div>
            <Link
              to={`/${slug}/agendar`}
              className="flex-shrink-0 rounded-xl bg-primario px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Agendar agora
            </Link>
          </div>
        </section>
      )}

      {/* Payment */}
      {temPagamento && (
        <section className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primario">Pagamento</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Como pagar</h2>
            </div>
            <div className="mx-auto max-w-xl">
              <div className="grid gap-4 sm:grid-cols-2">
                {pagina.pixChave && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Chave PIX
                    </div>
                    <p className="break-all font-semibold text-slate-900">{pagina.pixChave}</p>
                  </div>
                )}
                {pagina.linkPagamento && (
                  <a
                    href={pagina.linkPagamento}
                    rel="noreferrer"
                    target="_blank"
                    className="flex flex-col justify-center rounded-2xl border border-primario bg-teal-50 p-5 transition hover:bg-teal-100"
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primario">Link de pagamento</div>
                    <div className="flex items-center gap-2 font-semibold text-teal-900">
                      Abrir link
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                )}
              </div>
              {pagina.instrucoesPagamento && (
                <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {pagina.instrucoesPagamento}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section
        ref={contatoRef}
        id="contato"
        className="relative overflow-hidden py-20"
        style={{ background: GRADIENT }}
      >
        <div className="absolute inset-0 opacity-5" style={DOT_PATTERN} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/60">Contato</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Vamos conversar?</h2>
              <p className="mt-4 text-lg leading-8 text-white/70">
                Preencha o formulário e entrarei em contato o mais breve possível.
              </p>
              {pagina.telefone && (
                <a
                  href={`tel:${pagina.telefone}`}
                  className="mt-8 flex w-fit items-center gap-3 text-sm font-medium text-white/70 transition hover:text-white"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  {mascararTelefone(pagina.telefone)}
                </a>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-2xl md:p-8">
              {enviado ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                    <svg className="h-8 w-8 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">Mensagem enviada!</h3>
                  <p className="mt-2 text-sm text-slate-500">O profissional recebeu seu contato e poderá responder em breve.</p>
                  <button className="mt-6 text-sm font-semibold text-primario hover:underline" onClick={() => setEnviado(false)} type="button">
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={enviarContato}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo rotulo="Nome" name="h-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    <Campo rotulo="E-mail" name="h-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Campo
                    rotulo="Telefone (opcional)"
                    name="h-telefone"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                  />
                  <CampoArea rotulo="Mensagem (opcional)" name="h-mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} maxLength={1000} />
                  {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
                  <Botao type="submit" carregando={enviando} larguraTotal>
                    {enviando ? 'Enviando...' : 'Enviar mensagem'}
                  </Botao>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
