import { FormEvent, useMemo, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Contato } from '../tipos/contatos';
import type { Consultoria, ModalidadeConsultoria } from '../tipos/consultorias';

type PainelConsultoriasProps = {
  alunos: Contato[];
  pacientes: Contato[];
  consultorias: Consultoria[];
  aoCriar: (dados: {
    titulo: string;
    descricao: string;
    modalidade: ModalidadeConsultoria;
    publico: 'ALUNO' | 'PACIENTE';
    alunoId: string;
    pacienteId: string;
    inicioEm: string;
    fimEm: string;
    local: string;
    linkOnline: string;
  }) => Promise<void>;
};

export function PainelConsultorias({
  alunos,
  pacientes,
  consultorias,
  aoCriar,
}: PainelConsultoriasProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeConsultoria>('ONLINE');
  const [publico, setPublico] = useState<'ALUNO' | 'PACIENTE'>('ALUNO');
  const [alunoId, setAlunoId] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [inicioEm, setInicioEm] = useState('');
  const [fimEm, setFimEm] = useState('');
  const [local, setLocal] = useState('');
  const [linkOnline, setLinkOnline] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const pessoas = useMemo(() => (publico === 'ALUNO' ? alunos : pacientes), [alunos, pacientes, publico]);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await aoCriar({
        titulo,
        descricao,
        modalidade,
        publico,
        alunoId,
        pacienteId,
        inicioEm,
        fimEm,
        local,
        linkOnline,
      });
      setTitulo('');
      setDescricao('');
      setModalidade('ONLINE');
      setPublico('ALUNO');
      setAlunoId('');
      setPacienteId('');
      setInicioEm('');
      setFimEm('');
      setLocal('');
      setLinkOnline('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a consultoria.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Consultorias</h2>
        <p className="mt-1 text-sm text-slate-600">Organize consultorias para alunos ou pacientes.</p>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={criar}>
        <CampoTexto
          rotulo="Título"
          name="consultoria-titulo"
          value={titulo}
          onChange={(evento) => setTitulo(evento.target.value)}
          required
        />
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Descrição opcional</span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            maxLength={2000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Para quem</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={publico}
              onChange={(evento) => setPublico(evento.target.value as 'ALUNO' | 'PACIENTE')}
            >
              <option value="ALUNO">Aluno</option>
              <option value="PACIENTE">Paciente</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Pessoa vinculada</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={publico === 'ALUNO' ? alunoId : pacienteId}
              onChange={(evento) => {
                if (publico === 'ALUNO') {
                  setAlunoId(evento.target.value);
                } else {
                  setPacienteId(evento.target.value);
                }
              }}
              required
            >
              <option value="">Selecione</option>
              {pessoas.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {[pessoa.nome, pessoa.sobrenome].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Modalidade</span>
            <select
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={modalidade}
              onChange={(evento) => setModalidade(evento.target.value as ModalidadeConsultoria)}
            >
              <option value="ONLINE">Online</option>
              <option value="PRESENCIAL">Presencial</option>
            </select>
          </label>
          <CampoTexto
            rotulo="Início opcional"
            name="consultoria-inicio"
            type="datetime-local"
            value={inicioEm}
            onChange={(evento) => setInicioEm(evento.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Fim opcional"
            name="consultoria-fim"
            type="datetime-local"
            value={fimEm}
            onChange={(evento) => setFimEm(evento.target.value)}
          />
          {modalidade === 'PRESENCIAL' ? (
            <CampoTexto
              rotulo="Local"
              name="consultoria-local"
              value={local}
              onChange={(evento) => setLocal(evento.target.value)}
              required
            />
          ) : (
            <CampoTexto
              rotulo="Link online"
              name="consultoria-link"
              value={linkOnline}
              onChange={(evento) => setLinkOnline(evento.target.value)}
              required
            />
          )}
        </div>

        {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

        <button
          className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviando}
          type="submit"
        >
          {enviando ? 'Salvando...' : 'Adicionar consultoria'}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {consultorias.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma consultoria cadastrada.</p>
        ) : (
          <ul className="space-y-3">
            {consultorias.map((consultoria) => (
              <li key={consultoria.id} className="rounded-md bg-slate-50 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{consultoria.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {consultoria.aluno
                        ? `Aluno: ${[consultoria.aluno.nome, consultoria.aluno.sobrenome].filter(Boolean).join(' ')}`
                        : `Paciente: ${[consultoria.paciente?.nome, consultoria.paciente?.sobrenome]
                            .filter(Boolean)
                            .join(' ')}`}
                    </p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {consultoria.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                  </span>
                </div>
                {consultoria.descricao ? <p className="mt-2 text-sm text-slate-600">{consultoria.descricao}</p> : null}
                {consultoria.inicioEm ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Início: {new Date(consultoria.inicioEm).toLocaleString('pt-BR')}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
