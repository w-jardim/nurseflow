import { FormEvent, useState } from 'react';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Curso, InscricaoCurso, ModalidadeCurso, StatusCurso } from '../tipos/cursos';
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
  aoAtualizar: (id: string, dados: {
    titulo: string;
    slug: string;
    descricao: string;
    modalidade: ModalidadeCurso;
    precoCentavos: number;
    status: StatusCurso;
  }) => Promise<void>;
  aoExcluir: (id: string) => Promise<void>;
  aoInscrever: (dados: { cursoId: string; alunoId: string }) => Promise<InscricaoCurso>;
};

function gerarSlug(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function PainelCursos({ cursos, alunos, aoCriar, aoAtualizar, aoExcluir, aoInscrever }: PainelCursosProps) {
  const toast = useToast();

  const [titulo, setTitulo] = useState('');
  const [slug, setSlug] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeCurso>('ONLINE');
  const [preco, setPreco] = useState('');
  const [status, setStatus] = useState<StatusCurso>('RASCUNHO');
  const [enviando, setEnviando] = useState(false);

  const [cursoInscricaoId, setCursoInscricaoId] = useState('');
  const [alunoInscricaoId, setAlunoInscricaoId] = useState('');
  const [acessoAluno, setAcessoAluno] = useState<InscricaoCurso['acessoAluno']>(null);
  const [enviandoInscricao, setEnviandoInscricao] = useState(false);
  const [modalCursoAberto, setModalCursoAberto] = useState(false);
  const [modalAcessoAberto, setModalAcessoAberto] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [cursoExcluindo, setCursoExcluindo] = useState<Curso | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function preencherFormulario(curso: Curso) {
    setTitulo(curso.titulo);
    setSlug(curso.slug);
    setDescricao(curso.descricao ?? '');
    setModalidade(curso.modalidade);
    setPreco(mascararReais(String(curso.precoCentavos)));
    setStatus(curso.status);
  }

  function limparFormularioCurso() {
    setTitulo('');
    setSlug('');
    setDescricao('');
    setModalidade('ONLINE');
    setPreco('');
    setStatus('RASCUNHO');
  }

  function abrirNovoCurso() {
    setCursoEditando(null);
    limparFormularioCurso();
    setModalCursoAberto(true);
  }

  function abrirEdicao(curso: Curso) {
    setCursoEditando(curso);
    preencherFormulario(curso);
    setModalCursoAberto(true);
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
      await aoCriar({ titulo, slug, descricao, modalidade, precoCentavos, status });
      limparFormularioCurso();
      setModalCursoAberto(false);
      toast('Curso cadastrado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o curso.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!cursoEditando) return;

    const precoCentavos = reaisParaCentavos(preco);
    if (precoCentavos > PRECO_MAXIMO_CENTAVOS) {
      toast(`Preço máximo: ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`, 'aviso');
      return;
    }

    setSalvandoEdicao(true);
    try {
      await aoAtualizar(cursoEditando.id, { titulo, slug, descricao, modalidade, precoCentavos, status });
      setModalCursoAberto(false);
      setCursoEditando(null);
      limparFormularioCurso();
      toast('Curso atualizado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível atualizar o curso.', 'erro');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function confirmarExclusao() {
    if (!cursoExcluindo) return;

    setExcluindo(true);
    try {
      await aoExcluir(cursoExcluindo.id);
      setCursoExcluindo(null);
      toast('Curso excluído.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível excluir o curso.', 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  async function inscrever(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setAcessoAluno(null);
    setEnviandoInscricao(true);

    try {
      const inscricao = await aoInscrever({ cursoId: cursoInscricaoId, alunoId: alunoInscricaoId });
      setCursoInscricaoId('');
      setAlunoInscricaoId('');
      setAcessoAluno(inscricao.acessoAluno);
      toast('Acesso liberado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível liberar o acesso.', 'erro');
    } finally {
      setEnviandoInscricao(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Cursos</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Catálogo do profissional</h2>
            <p className="mt-1 text-sm text-slate-500">
              Crie cursos, publique ofertas e libere acesso após confirmação do pagamento direto.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Botao variante="contorno" onClick={() => setModalAcessoAberto(true)} disabled={cursos.length === 0 || alunos.length === 0}>
              Liberar acesso
            </Botao>
            <Botao onClick={abrirNovoCurso}>Novo curso</Botao>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
            </p>
            <p className="mt-1 text-sm text-slate-500">Gerencie o que aparece para alunos e visitantes.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              {cursos.filter((curso) => curso.status === 'PUBLICADO').length} publicados
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
              {cursos.filter((curso) => curso.status !== 'PUBLICADO').length} rascunhos
            </span>
          </div>
        </div>

        {cursos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum curso cadastrado"
            descricao="Crie seu primeiro curso para começar a montar a apostila online."
            acaoRotulo="Criar curso"
            aoAcionar={abrirNovoCurso}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        ) : (
          <ul className="grid gap-4 p-6 lg:grid-cols-2">
            {cursos.map((curso) => (
              <li key={curso.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-primario hover:bg-white hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{curso.titulo}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">/{curso.slug}</p>
                  </div>
                  <span className="rounded-xl bg-white px-3 py-1 text-sm font-semibold text-primario shadow-sm">
                    {formatarReais(curso.precoCentavos)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge cor={curso.status === 'PUBLICADO' ? 'verde' : 'cinza'}>
                      {curso.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <Badge cor={curso.modalidade === 'ONLINE' ? 'azul' : 'ciano'}>
                      {curso.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                    </Badge>
                    {curso.descricao && (
                      <span className="line-clamp-2 text-sm text-slate-500">{curso.descricao}</span>
                    )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Botao tamanho="sm" variante="fantasma" onClick={() => abrirEdicao(curso)}>
                    Editar
                  </Botao>
                  <Botao tamanho="sm" variante="perigo" onClick={() => setCursoExcluindo(curso)}>
                    Excluir
                  </Botao>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalCursoAberto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">
                  {cursoEditando ? 'Editar curso' : 'Novo curso'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {cursoEditando ? 'Atualizar curso' : 'Criar curso'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Defina o catálogo. A apostila é montada na seção de conteúdo.
                </p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  setModalCursoAberto(false);
                  setCursoEditando(null);
                  limparFormularioCurso();
                }}
                type="button"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </div>
            <form className="grid gap-4 px-6 py-5" onSubmit={cursoEditando ? salvarEdicao : criar}>
              <Campo
                rotulo="Título"
                name="curso-titulo"
                placeholder="Ex.: Primeiros Socorros Básicos"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  setSlug(gerarSlug(e.target.value));
                }}
                required
              />
              <Campo
                rotulo="Endereço gerado"
                name="curso-slug"
                placeholder="primeiros-socorros-basicos"
                value={slug}
                readOnly
                ajuda="Gerado automaticamente a partir do título"
                required
              />
              <CampoArea
                rotulo="Descrição"
                name="curso-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={2000}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoSelect
                  rotulo="Modalidade"
                  value={modalidade}
                  onChange={(v) => setModalidade(v as ModalidadeCurso)}
                >
                  <option value="ONLINE">Online</option>
                  <option value="PRESENCIAL">Presencial</option>
                </CampoSelect>
                <Campo
                  rotulo="Preço"
                  name="curso-preco"
                  placeholder="0,00"
                  inputMode="numeric"
                  value={preco}
                  onChange={(e) => setPreco(mascararReais(e.target.value))}
                  required
                />
                <CampoSelect
                  rotulo="Status"
                  value={status}
                  onChange={(v) => setStatus(v as StatusCurso)}
                >
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="PUBLICADO">Publicado</option>
                </CampoSelect>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Botao
                  type="button"
                  variante="fantasma"
                  onClick={() => {
                    setModalCursoAberto(false);
                    setCursoEditando(null);
                    limparFormularioCurso();
                  }}
                >
                  Cancelar
                </Botao>
                <Botao type="submit" carregando={cursoEditando ? salvandoEdicao : enviando}>
                  {cursoEditando
                    ? salvandoEdicao ? 'Salvando...' : 'Salvar alterações'
                    : enviando ? 'Salvando...' : 'Criar curso'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {cursoExcluindo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Excluir curso</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">{cursoExcluindo.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                O curso será removido do catálogo e arquivado. Esta ação não apaga registros de auditoria.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
              <Botao type="button" variante="fantasma" onClick={() => setCursoExcluindo(null)}>
                Cancelar
              </Botao>
              <Botao type="button" variante="perigo" carregando={excluindo} onClick={() => void confirmarExclusao()}>
                {excluindo ? 'Excluindo...' : 'Excluir curso'}
              </Botao>
            </div>
          </div>
        </div>
      ) : null}

      {modalAcessoAberto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">Acesso do aluno</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Liberar curso</h3>
                <p className="mt-1 text-sm text-slate-500">Use somente após confirmar o pagamento direto.</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setModalAcessoAberto(false)}
                type="button"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </div>
            <form className="grid gap-4 px-6 py-5" onSubmit={inscrever}>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoSelect rotulo="Curso" value={cursoInscricaoId} onChange={setCursoInscricaoId} required>
                  <option value="">Selecione</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
                </CampoSelect>
                <CampoSelect rotulo="Aluno" value={alunoInscricaoId} onChange={setAlunoInscricaoId} required>
                  <option value="">Selecione</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} {a.sobrenome} — {a.email}
                    </option>
                  ))}
                </CampoSelect>
              </div>

              {acessoAluno ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800">Acesso liberado.</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Login: <span className="font-semibold">{acessoAluno.email}</span> · Senha temporária:{' '}
                    <span className="font-mono font-semibold">{acessoAluno.senhaTemporaria}</span>
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Botao type="button" variante="fantasma" onClick={() => setModalAcessoAberto(false)}>
                  Cancelar
                </Botao>
                <Botao type="submit" carregando={enviandoInscricao} disabled={cursos.length === 0 || alunos.length === 0}>
                  {enviandoInscricao ? 'Liberando...' : 'Liberar acesso'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
