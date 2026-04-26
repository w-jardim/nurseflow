import { FormEvent, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Curso, ModalidadeCurso, StatusCurso } from '../tipos/cursos';
import type { Contato } from '../tipos/contatos';
import { formatarReais, mascararReais, reaisParaCentavos } from '../utilitarios/moeda';

const PRECO_MAXIMO_CENTAVOS = 100000000;

type PainelCursosProps = {
  cursos: Curso[];
  alunos: Contato[];
  aoCriar: (dados: {
    titulo: string;
    slug: string;
    descricao: string;
    modalidade: ModalidadeCurso;
    precoCentavos: number;
    status: StatusCurso;
  }) => Promise<void>;
  aoInscrever: (dados: { cursoId: string; alunoId: string }) => Promise<void>;
};

function gerarSlug(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function PainelCursos({ cursos, alunos, aoCriar, aoInscrever }: PainelCursosProps) {
  const [titulo, setTitulo] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeCurso>('ONLINE');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState<StatusCurso>('RASCUNHO');
  const [erro, setErro] = useState('');
  const [cursoInscricaoId, setCursoInscricaoId] = useState('');
  const [alunoInscricaoId, setAlunoInscricaoId] = useState('');
  const [erroInscricao, setErroInscricao] = useState('');
  const [inscricaoSalva, setInscricaoSalva] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviandoInscricao, setEnviandoInscricao] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    const precoCentavos = reaisParaCentavos(preco);

    if (precoCentavos > PRECO_MAXIMO_CENTAVOS) {
      setErro(`Preço máximo permitido: ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`);
      return;
    }

    setEnviando(true);

    try {
      await aoCriar({
        titulo,
        slug,
        descricao,
        modalidade,
        precoCentavos,
        status,
      });
      setTitulo('');
      setSlug('');
      setDescricao('');
      setModalidade('ONLINE');
      setPreco('');
      setStatus('RASCUNHO');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o curso.');
    } finally {
      setEnviando(false);
    }
  }

  async function inscrever(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroInscricao('');
    setInscricaoSalva(false);
    setEnviandoInscricao(true);

    try {
      await aoInscrever({ cursoId: cursoInscricaoId, alunoId: alunoInscricaoId });
      setCursoInscricaoId('');
      setAlunoInscricaoId('');
      setInscricaoSalva(true);
    } catch (error) {
      setErroInscricao(error instanceof Error ? error.message : 'Não foi possível liberar o acesso.');
    } finally {
      setEnviandoInscricao(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Cursos</h2>
        <p className="mt-1 text-sm text-slate-600">Cadastre cursos em rascunho ou publicados.</p>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={criar}>
        <CampoTexto
          rotulo="Título"
          name="curso-titulo"
          value={titulo}
          onChange={(evento) => {
            const novoTitulo = evento.target.value;
            setTitulo(novoTitulo);
            setSlug(gerarSlug(novoTitulo));
          }}
          required
        />
        <CampoTexto
          rotulo="Endereço gerado para o curso"
          name="curso-slug"
          placeholder="primeiros-socorros"
          value={slug}
          readOnly
          required
        />
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Descrição opcional</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            maxLength={2000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Modalidade</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={modalidade}
              onChange={(evento) => setModalidade(evento.target.value as ModalidadeCurso)}
            >
              <option value="ONLINE">Online</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
          </label>
          <CampoTexto
            rotulo="Preço"
            name="curso-preco"
            placeholder="0,00"
            inputMode="numeric"
            value={preco}
            onChange={(evento) => setPreco(mascararReais(evento.target.value))}
            required
          />
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Status</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={status}
              onChange={(evento) => setStatus(evento.target.value as StatusCurso)}
            >
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADO">Publicado</option>
            </select>
          </label>
        </div>

        {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

        <button
          className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviando}
          type="submit"
        >
          {enviando ? 'Salvando...' : 'Adicionar curso'}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {cursos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum curso cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {cursos.map((curso) => (
              <li key={curso.id} className="rounded-md bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{curso.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">Página: /{curso.slug}</p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {curso.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {curso.modalidade === 'ONLINE' ? 'Curso online' : 'Curso presencial'}
                </p>
                <p className="mt-2 text-sm text-slate-700">{formatarReais(curso.precoCentavos)}</p>
                {curso.descricao ? <p className="mt-1 text-sm text-slate-600">{curso.descricao}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="mt-5 border-t border-slate-100 pt-4" onSubmit={inscrever}>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Liberar acesso</h3>
          <p className="mt-1 text-sm text-slate-600">
            Use após confirmar o pagamento direto com o aluno.
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Curso</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              required
              value={cursoInscricaoId}
              onChange={(evento) => setCursoInscricaoId(evento.target.value)}
            >
              <option value="">Selecione</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Aluno</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              required
              value={alunoInscricaoId}
              onChange={(evento) => setAlunoInscricaoId(evento.target.value)}
            >
              <option value="">Selecione</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} {aluno.sobrenome} - {aluno.email}
                </option>
              ))}
            </select>
          </label>
        </div>

        {erroInscricao ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erroInscricao}</p> : null}
        {inscricaoSalva ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Acesso liberado.</p> : null}

        <button
          className="mt-3 h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviandoInscricao || cursos.length === 0 || alunos.length === 0}
          type="submit"
        >
          {enviandoInscricao ? 'Liberando...' : 'Liberar acesso'}
        </button>
      </form>
    </article>
  );
}
