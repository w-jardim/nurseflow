import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
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
  const [carregando, setCarregando] = useState(false);
  const [salvandoModulo, setSalvandoModulo] = useState(false);
  const [salvandoAula, setSalvandoAula] = useState(false);

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
        corpo: { titulo: tituloAula, descricao: descricaoAula || undefined },
      });
      setModulos((prev) =>
        prev.map((m) => (m.id === moduloAulaId ? { ...m, aulas: [...m.aulas, aula] } : m)),
      );
      setTituloAula('');
      setDescricaoAula('');
      toast('Aula adicionada.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a aula.', 'erro');
    } finally {
      setSalvandoAula(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">Conteúdo do curso</h2>
          <p className="mt-0.5 text-sm text-slate-500">Organize em módulos e aulas.</p>
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
          <p className="mt-2 text-xs text-slate-400">Editando: {cursoSelecionado.titulo}</p>
        )}

        {cursoId && (
          <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">
            <form className="space-y-3" onSubmit={criarModulo}>
              <p className="text-sm font-semibold text-slate-700">Novo módulo</p>
              <Campo
                rotulo="Título do módulo"
                name="modulo-titulo"
                value={tituloModulo}
                onChange={(e) => setTituloModulo(e.target.value)}
                required
              />
              <Botao
                type="submit"
                variante="secundario"
                larguraTotal
                carregando={salvandoModulo}
                disabled={!cursoId}
              >
                {salvandoModulo ? 'Adicionando...' : 'Adicionar módulo'}
              </Botao>
            </form>

            <form className="space-y-3" onSubmit={criarAula}>
              <p className="text-sm font-semibold text-slate-700">Nova aula</p>
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
                rotulo="Descrição (opcional)"
                name="aula-descricao"
                value={descricaoAula}
                onChange={(e) => setDescricaoAula(e.target.value)}
                maxLength={2000}
                className="min-h-16"
              />
              <Botao
                type="submit"
                variante="secundario"
                larguraTotal
                carregando={salvandoAula}
                disabled={!cursoId || !moduloAulaId}
              >
                {salvandoAula ? 'Adicionando...' : 'Adicionar aula'}
              </Botao>
            </form>
          </div>
        )}
      </div>

      {cursoId && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Estrutura do curso
            </p>
          </div>

          {carregando ? (
            <div className="px-6 py-8 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primario border-t-transparent" />
            </div>
          ) : modulos.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum módulo ainda"
              descricao="Adicione módulos e aulas usando os formulários acima."
              icone={
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {modulos.map((modulo) => (
                <div key={modulo.id} className="px-6 py-4">
                  <p className="font-semibold text-slate-800">
                    {modulo.ordem}. {modulo.titulo}
                  </p>
                  {modulo.aulas.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-400">Nenhuma aula neste módulo.</p>
                  ) : (
                    <ol className="mt-2 space-y-1.5 pl-4">
                      {modulo.aulas.map((aula) => (
                        <li key={aula.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                          <p className="text-sm font-medium text-slate-700">
                            {aula.ordem}. {aula.titulo}
                          </p>
                          {aula.descricao && (
                            <p className="mt-0.5 text-xs text-slate-500">{aula.descricao}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
