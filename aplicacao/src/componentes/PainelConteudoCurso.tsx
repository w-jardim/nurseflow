import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { EditorRico } from './ui/EditorRico';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import { requisitarApi } from '../servicos/api';
import type { AulaCurso, Curso, ModuloCurso } from '../tipos/cursos';

type PainelConteudoCursoProps = {
  cursos: Curso[];
};

export function PainelConteudoCurso({ cursos }: PainelConteudoCursoProps) {
  const toast = useToast();
  const [cursoId, setCursoId] = useState('');
  const [modulos, setModulos] = useState<ModuloCurso[]>([]);
  const [tituloModulo, setTituloModulo] = useState('');
  const [moduloAulaId, setModuloAulaId] = useState('');
  const [tituloAula, setTituloAula] = useState('');
  const [descricaoAula, setDescricaoAula] = useState('');
  const [conteudoAula, setConteudoAula] = useState('');
  const [imagemAulaUrl, setImagemAulaUrl] = useState('');
  const [materialAulaUrl, setMaterialAulaUrl] = useState('');
  const [videoReferencia, setVideoReferencia] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvandoModulo, setSalvandoModulo] = useState(false);
  const [salvandoAula, setSalvandoAula] = useState(false);
  const [painelAtivo, setPainelAtivo] = useState<'modulo' | 'aula'>('modulo');

  const cursoSelecionado = useMemo(() => cursos.find((c) => c.id === cursoId) ?? null, [cursoId, cursos]);

  useEffect(() => {
    if (!cursoId) {
      setModulos([]);
      setModuloAulaId('');
      return;
    }

    setCarregando(true);
    requisitarApi<ModuloCurso[]>(`/cursos/${cursoId}/modulos`, { autenticada: true })
      .then((res) => {
        setModulos(res);
        setModuloAulaId(res[0]?.id ?? '');
      })
      .catch((err) => toast(err instanceof Error ? err.message : 'Erro ao carregar conteúdo.', 'erro'))
      .finally(() => setCarregando(false));
  }, [cursoId]);

  async function criarModulo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!cursoId) { toast('Selecione um curso.', 'aviso'); return; }
    setSalvandoModulo(true);

    try {
      const modulo = await requisitarApi<ModuloCurso>(`/cursos/${cursoId}/modulos`, {
        metodo: 'POST',
        autenticada: true,
        corpo: { titulo: tituloModulo },
      });
      setModulos((prev) => [...prev, modulo]);
      setModuloAulaId(modulo.id);
      setTituloModulo('');
      setPainelAtivo('aula');
      toast('Módulo adicionado.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar o módulo.', 'erro');
    } finally {
      setSalvandoModulo(false);
    }
  }

  async function criarAula(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!cursoId || !moduloAulaId) { toast('Selecione um curso e módulo.', 'aviso'); return; }
    setSalvandoAula(true);

    try {
      const aula = await requisitarApi<AulaCurso>(`/cursos/${cursoId}/modulos/${moduloAulaId}/aulas`, {
        metodo: 'POST',
        autenticada: true,
        corpo: {
          titulo: tituloAula,
          descricao: descricaoAula || undefined,
          conteudo: conteudoAula || undefined,
          imagemUrl: imagemAulaUrl || undefined,
          materialUrl: materialAulaUrl || undefined,
          videoReferencia: videoReferencia || undefined,
        },
      });
      setModulos((prev) =>
        prev.map((m) => (m.id === moduloAulaId ? { ...m, aulas: [...m.aulas, aula] } : m)),
      );
      setTituloAula('');
      setDescricaoAula('');
      setConteudoAula('');
      setImagemAulaUrl('');
      setMaterialAulaUrl('');
      setVideoReferencia('');
      toast('Aula adicionada.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a aula.', 'erro');
    } finally {
      setSalvandoAula(false);
    }
  }

  function selecionarImagemAula(arquivo: File | null) {
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      toast('Selecione um arquivo de imagem.', 'aviso');
      return;
    }

    if (arquivo.size > 700 * 1024) {
      toast('Use uma imagem de até 700 KB neste MVP.', 'aviso');
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => setImagemAulaUrl(String(leitor.result ?? ''));
    leitor.onerror = () => toast('Não foi possível carregar a imagem.', 'erro');
    leitor.readAsDataURL(arquivo);
  }

  const totalAulas = modulos.reduce((total, modulo) => total + modulo.aulas.length, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Editor de apostila</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Monte a estrutura do curso e adicione aulas somente quando precisar.
            </p>
          </div>
          {cursoSelecionado ? (
            <div className="grid grid-cols-2 gap-2 sm:w-56">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Módulos</p>
                <p className="text-lg font-bold text-slate-900">{modulos.length}</p>
              </div>
              <div className="rounded-xl bg-teal-50 px-3 py-2">
                <p className="text-xs text-teal-700">Aulas</p>
                <p className="text-lg font-bold text-teal-800">{totalAulas}</p>
              </div>
            </div>
          ) : null}
        </div>

        <CampoSelect rotulo="Selecionar curso" value={cursoId} onChange={setCursoId}>
          <option value="">Selecione um curso</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titulo}
            </option>
          ))}
        </CampoSelect>

        {cursoSelecionado && (
          <p className="mt-2 text-xs text-slate-400">Apostila ativa: {cursoSelecionado.titulo}</p>
        )}

        {cursoId && (
          <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Estrutura da apostila
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Módulos e aulas que o aluno verá no portal.
                  </p>
                </div>
                <Botao tamanho="sm" variante="contorno" onClick={() => setPainelAtivo('modulo')}>
                  Novo módulo
                </Botao>
              </div>

              {carregando ? (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primario border-t-transparent" />
                </div>
              ) : modulos.length === 0 ? (
                <EstadoVazio
                  titulo="Comece criando o primeiro módulo"
                  descricao="Depois disso, você poderá adicionar aulas com texto, imagem e materiais."
                  acaoRotulo="Criar módulo"
                  aoAcionar={() => setPainelAtivo('modulo')}
                  icone={
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  }
                />
              ) : (
                <div className="divide-y divide-slate-200">
                  {modulos.map((modulo) => (
                    <div key={modulo.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {modulo.ordem}. {modulo.titulo}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{modulo.aulas.length} aulas</p>
                        </div>
                        <Botao
                          tamanho="sm"
                          variante="fantasma"
                          onClick={() => {
                            setModuloAulaId(modulo.id);
                            setPainelAtivo('aula');
                          }}
                        >
                          Adicionar aula
                        </Botao>
                      </div>
                      {modulo.aulas.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-400">
                          Nenhuma aula neste módulo.
                        </p>
                      ) : (
                        <ol className="mt-3 space-y-2">
                          {modulo.aulas.map((aula) => (
                            <li key={aula.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-primario">
                                  {aula.ordem}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-slate-800">{aula.titulo}</p>
                                  {aula.descricao && (
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{aula.descricao}</p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                                    {aula.conteudo ? (
                                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">
                                        Apostila
                                      </span>
                                    ) : null}
                                    {aula.imagemUrl ? (
                                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                                        Imagem
                                      </span>
                                    ) : null}
                                    {aula.materialUrl ? (
                                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                                        Material
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Ações
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      painelAtivo === 'modulo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                    onClick={() => setPainelAtivo('modulo')}
                    type="button"
                  >
                    Módulo
                  </button>
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      painelAtivo === 'aula' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                    disabled={modulos.length === 0}
                    onClick={() => setPainelAtivo('aula')}
                    type="button"
                  >
                    Aula
                  </button>
                </div>
              </div>

              <div className="p-4">
                {painelAtivo === 'modulo' ? (
                  <form className="space-y-3" onSubmit={criarModulo}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Novo módulo</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Use módulos para separar capítulos da apostila.
                      </p>
                    </div>
                    <Campo
                      rotulo="Título do módulo"
                      name="modulo-titulo"
                      value={tituloModulo}
                      onChange={(e) => setTituloModulo(e.target.value)}
                      required
                    />
                    <Botao
                      type="submit"
                      variante="primario"
                      larguraTotal
                      carregando={salvandoModulo}
                      disabled={!cursoId}
                    >
                      {salvandoModulo ? 'Adicionando...' : 'Adicionar módulo'}
                    </Botao>
                  </form>
                ) : (
                  <form className="space-y-3" onSubmit={criarAula}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Nova aula/apostila</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Crie o conteúdo que o aluno vai estudar.
                      </p>
                    </div>
                    <CampoSelect
                      rotulo="Módulo"
                      value={moduloAulaId}
                      onChange={setModuloAulaId}
                      required
                    >
                      <option value="">Selecione</option>
                      {modulos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.ordem}. {m.titulo}
                        </option>
                      ))}
                    </CampoSelect>
                    <Campo
                      rotulo="Título da aula"
                      name="aula-titulo"
                      value={tituloAula}
                      onChange={(e) => setTituloAula(e.target.value)}
                      required
                    />
                    <CampoArea
                      rotulo="Resumo"
                      name="aula-descricao"
                      value={descricaoAula}
                      onChange={(e) => setDescricaoAula(e.target.value)}
                      maxLength={2000}
                      className="min-h-16"
                    />
                    <EditorRico
                      rotulo="Apostila"
                      valor={conteudoAula}
                      onChange={setConteudoAula}
                      ajuda="Formatação básica"
                    />
                    <div className="grid gap-3">
                      <Campo
                        rotulo="Vídeo ou referência"
                        name="aula-video"
                        value={videoReferencia}
                        onChange={(e) => setVideoReferencia(e.target.value)}
                      />
                      <Campo
                        rotulo="Material complementar"
                        name="aula-material"
                        value={materialAulaUrl}
                        onChange={(e) => setMaterialAulaUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">Imagem da aula</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Use PNG/JPG leve para ilustrar a apostila.
                      </p>
                      <input
                        accept="image/*"
                        className="mt-3 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                        onChange={(e) => selecionarImagemAula(e.target.files?.[0] ?? null)}
                        type="file"
                      />
                      {imagemAulaUrl ? (
                        <img
                          alt="Prévia da imagem da aula"
                          className="mt-4 max-h-48 w-full rounded-lg object-cover"
                          src={imagemAulaUrl}
                        />
                      ) : null}
                    </div>
                    <Botao
                      type="submit"
                      variante="primario"
                      larguraTotal
                      carregando={salvandoAula}
                      disabled={!cursoId || !moduloAulaId}
                    >
                      {salvandoAula ? 'Adicionando...' : 'Adicionar aula'}
                    </Botao>
                  </form>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
