import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import { requisitarApi } from '../servicos/api';
import type { AulaCurso, Curso, ModuloCurso } from '../tipos/cursos';

type PainelConteudoCursoProps = {
  cursos: Curso[];
};

export function PainelConteudoCurso({ cursos }: PainelConteudoCursoProps) {
  const [cursoId, setCursoId] = useState('');
  const [modulos, setModulos] = useState<ModuloCurso[]>([]);
  const [tituloModulo, setTituloModulo] = useState('');
  const [moduloAulaId, setModuloAulaId] = useState('');
  const [tituloAula, setTituloAula] = useState('');
  const [descricaoAula, setDescricaoAula] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvandoModulo, setSalvandoModulo] = useState(false);
  const [salvandoAula, setSalvandoAula] = useState(false);

  const cursoSelecionado = useMemo(
    () => cursos.find((curso) => curso.id === cursoId) ?? null,
    [cursoId, cursos],
  );

  useEffect(() => {
    if (!cursoId) {
      setModulos([]);
      setModuloAulaId('');
      return;
    }

    setErro('');
    setCarregando(true);
    requisitarApi<ModuloCurso[]>(`/cursos/${cursoId}/modulos`, { autenticada: true })
      .then((resposta) => {
        setModulos(resposta);
        setModuloAulaId(resposta[0]?.id ?? '');
      })
      .catch((error) => setErro(error instanceof Error ? error.message : 'Não foi possível carregar o curso.'))
      .finally(() => setCarregando(false));
  }, [cursoId]);

  async function criarModulo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!cursoId) {
      setErro('Selecione um curso antes de criar módulos.');
      return;
    }

    setErro('');
    setSalvandoModulo(true);

    try {
      const modulo = await requisitarApi<ModuloCurso>(`/cursos/${cursoId}/modulos`, {
        metodo: 'POST',
        autenticada: true,
        corpo: { titulo: tituloModulo },
      });
      setModulos((atuais) => [...atuais, modulo]);
      setModuloAulaId(modulo.id);
      setTituloModulo('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar o módulo.');
    } finally {
      setSalvandoModulo(false);
    }
  }

  async function criarAula(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!cursoId || !moduloAulaId) {
      setErro('Selecione um curso e um módulo antes de criar aulas.');
      return;
    }

    setErro('');
    setSalvandoAula(true);

    try {
      const aula = await requisitarApi<AulaCurso>(`/cursos/${cursoId}/modulos/${moduloAulaId}/aulas`, {
        metodo: 'POST',
        autenticada: true,
        corpo: {
          titulo: tituloAula,
          descricao: descricaoAula || undefined,
        },
      });

      setModulos((atuais) =>
        atuais.map((modulo) =>
          modulo.id === moduloAulaId ? { ...modulo, aulas: [...modulo.aulas, aula] } : modulo,
        ),
      );
      setTituloAula('');
      setDescricaoAula('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar a aula.');
    } finally {
      setSalvandoAula(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Conteúdo do curso</h2>
        <p className="mt-1 text-sm text-slate-600">Organize o curso em módulos e aulas.</p>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-800">Curso</span>
        <select
          className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
          value={cursoId}
          onChange={(evento) => setCursoId(evento.target.value)}
        >
          <option value="">Selecione um curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.titulo}
            </option>
          ))}
        </select>
      </label>

      {cursoSelecionado ? (
        <p className="mt-2 text-sm text-slate-600">Editando: {cursoSelecionado.titulo}</p>
      ) : null}

      {erro ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form className="space-y-3" onSubmit={criarModulo}>
          <h3 className="font-semibold">Novo módulo</h3>
          <CampoTexto
            rotulo="Título do módulo"
            name="modulo-titulo"
            value={tituloModulo}
            onChange={(evento) => setTituloModulo(evento.target.value)}
            required
          />
          <button
            className="h-10 w-full rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={salvandoModulo || !cursoId}
            type="submit"
          >
            {salvandoModulo ? 'Salvando...' : 'Adicionar módulo'}
          </button>
        </form>

        <form className="space-y-3" onSubmit={criarAula}>
          <h3 className="font-semibold">Nova aula</h3>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Módulo</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={moduloAulaId}
              onChange={(evento) => setModuloAulaId(evento.target.value)}
              required
            >
              <option value="">Selecione um módulo</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.ordem}. {modulo.titulo}
                </option>
              ))}
            </select>
          </label>
          <CampoTexto
            rotulo="Título da aula"
            name="aula-titulo"
            value={tituloAula}
            onChange={(evento) => setTituloAula(evento.target.value)}
            required
          />
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Descrição opcional</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={descricaoAula}
              onChange={(evento) => setDescricaoAula(evento.target.value)}
              maxLength={2000}
            />
          </label>
          <button
            className="h-10 w-full rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={salvandoAula || !cursoId || !moduloAulaId}
            type="submit"
          >
            {salvandoAula ? 'Salvando...' : 'Adicionar aula'}
          </button>
        </form>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {carregando ? <p className="text-sm text-slate-500">Carregando conteúdo...</p> : null}
        {!carregando && cursoId && modulos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum módulo cadastrado para este curso.</p>
        ) : null}
        <div className="space-y-3">
          {modulos.map((modulo) => (
            <section key={modulo.id} className="rounded-md bg-slate-50 px-3 py-3">
              <h3 className="font-semibold">
                {modulo.ordem}. {modulo.titulo}
              </h3>
              {modulo.aulas.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Nenhuma aula neste módulo.</p>
              ) : (
                <ol className="mt-2 space-y-2">
                  {modulo.aulas.map((aula) => (
                    <li key={aula.id} className="rounded-md bg-white px-3 py-2 text-sm">
                      <p className="font-medium">
                        {aula.ordem}. {aula.titulo}
                      </p>
                      {aula.descricao ? <p className="mt-1 text-slate-600">{aula.descricao}</p> : null}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
