import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CampoTexto } from '../componentes/CampoTexto';
import { requisitarApi } from '../servicos/api';
import type { PaginaPublicaProfissional } from '../tipos/profissionais';
import { formatarReais } from '../utilitarios/moeda';
import { mascararTelefone } from '../utilitarios/mascaras';

type InteresseSelecionado = {
  origem: 'PERFIL' | 'CURSO' | 'CONSULTORIA' | 'SERVICO';
  titulo: string;
  cursoId?: string;
  consultoriaId?: string;
  servicoId?: string;
};

export function PaginaPublicaProfissional() {
  const { slug } = useParams();
  const [pagina, setPagina] = useState<PaginaPublicaProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [interesse, setInteresse] = useState<InteresseSelecionado>({
    origem: 'PERFIL',
    titulo: 'Página profissional',
  });
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erroInteresse, setErroInteresse] = useState('');
  const [interesseEnviado, setInteresseEnviado] = useState(false);
  const [enviandoInteresse, setEnviandoInteresse] = useState(false);

  useEffect(() => {
    if (!slug) {
      setErro(true);
      setCarregando(false);
      return;
    }

    requisitarApi<PaginaPublicaProfissional>(`/publico/profissionais/${slug}`)
      .then((resposta) => setPagina(resposta))
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, [slug]);

  async function enviarInteresse(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!pagina) {
      return;
    }

    setErroInteresse('');
    setInteresseEnviado(false);
    setEnviandoInteresse(true);

    try {
      await requisitarApi(`/publico/profissionais/${pagina.slug}/interesses`, {
        metodo: 'POST',
        corpo: {
          nome,
          email,
          telefone: telefone || undefined,
          mensagem: mensagem || undefined,
          origem: interesse.origem,
          cursoId: interesse.cursoId,
          consultoriaId: interesse.consultoriaId,
          servicoId: interesse.servicoId,
        },
      });
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
      setInteresseEnviado(true);
    } catch (error) {
      setErroInteresse(error instanceof Error ? error.message : 'Não foi possível registrar o interesse.');
    } finally {
      setEnviandoInteresse(false);
    }
  }

  if (carregando) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
        <p>Carregando página...</p>
      </main>
    );
  }

  if (erro || !pagina) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-slate-700">
        <div>
          <p className="text-lg font-semibold text-tinta">Página não encontrada.</p>
          <Link className="mt-4 inline-block font-semibold text-primario" to="/">
            Voltar para NurseFlow
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold text-primario">
            NurseFlow
          </Link>
          <span className="text-sm text-slate-500">/{pagina.slug}</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primario">Página profissional</p>
          <h1 className="mt-3 text-4xl font-bold">{pagina.nomePublico}</h1>
          {pagina.conselho ? <p className="mt-2 text-slate-700">{pagina.conselho}</p> : null}
          {pagina.bio ? <p className="mt-5 text-lg leading-8 text-slate-700">{pagina.bio}</p> : null}
          {pagina.telefone ? (
            <p className="mt-5 text-sm font-semibold text-slate-700">
              Contato: {mascararTelefone(pagina.telefone)}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          <section>
            <h2 className="text-xl font-semibold">Cursos</h2>
            <div className="mt-4 space-y-3">
              {pagina.cursos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum curso publicado.</p>
              ) : (
                pagina.cursos.map((curso) => (
                  <article key={curso.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{curso.titulo}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {curso.modalidade === 'ONLINE' ? 'Curso online' : 'Curso presencial'}
                        </p>
                      </div>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold">
                        {formatarReais(curso.precoCentavos)}
                      </span>
                    </div>
                    {curso.descricao ? <p className="mt-3 text-sm text-slate-600">{curso.descricao}</p> : null}
                    <button
                      className="mt-4 h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                      onClick={() =>
                        setInteresse({
                          origem: 'CURSO',
                          titulo: curso.titulo,
                          cursoId: curso.id,
                        })
                      }
                      type="button"
                    >
                      Tenho interesse
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Serviços</h2>
            <div className="mt-4 space-y-3">
              {pagina.servicos.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum serviço publicado.</p>
              ) : (
                pagina.servicos.map((servico) => (
                  <article key={servico.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{servico.titulo}</h3>
                        <p className="mt-1 text-sm text-slate-600">Serviço profissional</p>
                      </div>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold">
                        {servico.exibirPreco ? formatarReais(servico.precoCentavos) : 'Sob consulta'}
                      </span>
                    </div>
                    {servico.descricao ? <p className="mt-3 text-sm text-slate-600">{servico.descricao}</p> : null}
                    <button
                      className="mt-4 h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                      onClick={() =>
                        setInteresse({
                          origem: 'SERVICO',
                          titulo: servico.titulo,
                          servicoId: servico.id,
                        })
                      }
                      type="button"
                    >
                      Tenho interesse
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Consultorias</h2>
            <div className="mt-4 space-y-3">
              {pagina.consultorias.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma consultoria cadastrada.</p>
              ) : (
                pagina.consultorias.map((consultoria) => (
                  <article key={consultoria.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{consultoria.titulo}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {consultoria.modalidade === 'ONLINE' ? 'Consultoria online' : 'Consultoria presencial'}
                        </p>
                      </div>
                      <span className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold">
                        {formatarReais(consultoria.precoCentavos)}
                      </span>
                    </div>
                    {consultoria.descricao ? (
                      <p className="mt-3 text-sm text-slate-600">{consultoria.descricao}</p>
                    ) : null}
                    <button
                      className="mt-4 h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                      onClick={() =>
                        setInteresse({
                          origem: 'CONSULTORIA',
                          titulo: consultoria.titulo,
                          consultoriaId: consultoria.id,
                        })
                      }
                      type="button"
                    >
                      Tenho interesse
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        {pagina.pixChave || pagina.linkPagamento || pagina.instrucoesPagamento ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Pagamento direto ao profissional</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {pagina.pixChave ? (
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PIX</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">{pagina.pixChave}</p>
                </div>
              ) : null}
              {pagina.linkPagamento ? (
                <a
                  className="flex min-h-20 flex-col justify-center rounded-md border border-primario p-3 text-primario transition hover:bg-teal-50"
                  href={pagina.linkPagamento}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide">Link de pagamento</span>
                  <span className="mt-1 text-sm font-semibold">Abrir em nova aba</span>
                </a>
              ) : null}
            </div>
            {pagina.instrucoesPagamento ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
                {pagina.instrucoesPagamento}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mt-10 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Entrar em contato</h2>
              <p className="mt-1 text-sm text-slate-600">Interesse em: {interesse.titulo}</p>
            </div>
            {interesse.origem !== 'PERFIL' ? (
              <button
                className="text-sm font-semibold text-primario"
                onClick={() => setInteresse({ origem: 'PERFIL', titulo: 'Página profissional' })}
                type="button"
              >
                Limpar seleção
              </button>
            ) : null}
          </div>

          <form className="mt-5 grid gap-3" onSubmit={enviarInteresse}>
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoTexto
                rotulo="Nome"
                name="interesse-nome"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                required
              />
              <CampoTexto
                rotulo="E-mail"
                name="interesse-email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                required
              />
            </div>
            <CampoTexto
              rotulo="Telefone opcional"
              name="interesse-telefone"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(evento) => setTelefone(mascararTelefone(evento.target.value))}
            />
            <label className="block">
              <span className="text-sm font-medium text-slate-800">Mensagem opcional</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
                value={mensagem}
                onChange={(evento) => setMensagem(evento.target.value)}
                maxLength={1000}
              />
            </label>

            {erroInteresse ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erroInteresse}</p>
            ) : null}
            {interesseEnviado ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Interesse registrado. O profissional poderá retornar o contato.
              </p>
            ) : null}

            <button
              className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={enviandoInteresse}
              type="submit"
            >
              {enviandoInteresse ? 'Enviando...' : 'Enviar interesse'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
