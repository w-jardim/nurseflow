import { FormEvent, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Consultoria, ModalidadeConsultoria } from '../tipos/consultorias';
import { formatarReais, mascararReais, reaisParaCentavos } from '../utilitarios/moeda';

const PRECO_MAXIMO_CENTAVOS = 100000000;

type PainelConsultoriasProps = {
  consultorias: Consultoria[];
  aoCriar: (dados: {
    titulo: string;
    descricao: string;
    modalidade: ModalidadeConsultoria;
    precoCentavos: number;
  }) => Promise<void>;
};

export function PainelConsultorias({ consultorias, aoCriar }: PainelConsultoriasProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeConsultoria>('ONLINE');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

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
        descricao,
        modalidade,
        precoCentavos,
      });
      setTitulo('');
      setDescricao('');
      setModalidade('ONLINE');
      setPreco('');
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
        <p className="mt-1 text-sm text-slate-600">
          Cadastre consultorias como produtos avulsos, com modalidade e valor definido.
        </p>
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
            rotulo="Valor"
            name="consultoria-preco"
            placeholder="0,00"
            inputMode="numeric"
            value={preco}
            onChange={(evento) => setPreco(mascararReais(evento.target.value))}
            required
          />
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
                      {consultoria.modalidade === 'ONLINE' ? 'Consultoria online' : 'Consultoria presencial'}
                    </p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {formatarReais(consultoria.precoCentavos)}
                  </span>
                </div>
                {consultoria.descricao ? <p className="mt-2 text-sm text-slate-600">{consultoria.descricao}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
