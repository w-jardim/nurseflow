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

export function PainelCursos({ cursos, alunos, aoCriar, aoInscrever }: PainelCursosProps) {
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
      setTitulo(''); setSlug(''); setDescricao(''); setModalidade('ONLINE'); setPreco(''); setStatus('RASCUNHO');
      toast('Curso cadastrado com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o curso.', 'erro');
    } finally {
      setEnviando(false);
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
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">Novo curso</h2>
          <p className="mt-0.5 text-sm text-slate-500">Cadastre em rascunho ou já publicado.</p>
        </div>

        <form className="grid gap-4" onSubmit={criar}>
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
            rotulo="Descrição (opcional)"
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

          <Botao type="submit" carregando={enviando}>
            {enviando ? 'Salvando...' : 'Adicionar curso'}
          </Botao>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {cursos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum curso cadastrado"
            descricao="Crie seu primeiro curso usando o formulário acima."
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {cursos.map((curso) => (
              <li key={curso.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                <div>
                  <p className="font-medium text-slate-800">{curso.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-400">/{curso.slug}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge cor={curso.status === 'PUBLICADO' ? 'verde' : 'cinza'}>
                      {curso.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <Badge cor={curso.modalidade === 'ONLINE' ? 'azul' : 'ciano'}>
                      {curso.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                    </Badge>
                    {curso.descricao && (
                      <span className="text-sm text-slate-500">{curso.descricao}</span>
                    )}
                  </div>
                </div>
                <span className="rounded-xl bg-teal-50 px-3 py-1 text-sm font-semibold text-primario">
                  {formatarReais(curso.precoCentavos)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <h3 className="font-semibold text-slate-800">Liberar acesso</h3>
          <p className="mt-0.5 text-sm text-slate-500">Use após confirmar o pagamento direto com o aluno.</p>
        </div>

        <form className="grid gap-4" onSubmit={inscrever}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect
              rotulo="Curso"
              value={cursoInscricaoId}
              onChange={setCursoInscricaoId}
              required
            >
              <option value="">Selecione</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </CampoSelect>
            <CampoSelect
              rotulo="Aluno"
              value={alunoInscricaoId}
              onChange={setAlunoInscricaoId}
              required
            >
              <option value="">Selecione</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} {a.sobrenome} — {a.email}
                </option>
              ))}
            </CampoSelect>
          </div>

          {acessoAluno && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Acesso liberado.</p>
              <p className="mt-1 text-sm text-emerald-700">
                Login: <span className="font-semibold">{acessoAluno.email}</span> · Senha temporária:{' '}
                <span className="font-semibold font-mono">{acessoAluno.senhaTemporaria}</span>
              </p>
            </div>
          )}

          <Botao
            type="submit"
            carregando={enviandoInscricao}
            disabled={cursos.length === 0 || alunos.length === 0}
          >
            {enviandoInscricao ? 'Liberando...' : 'Liberar acesso'}
          </Botao>
        </form>
      </div>
    </div>
  );
}
