import { FormEvent, useState } from 'react';
import { Campo, CampoArea, CampoSelect } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
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
  const toast = useToast();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeConsultoria>('ONLINE');
  const [preco, setPreco] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const precoCentavos = reaisParaCentavos(preco);

    if (precoCentavos > PRECO_MAXIMO_CENTAVOS) {
      toast(`Preço máximo: ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`, 'aviso');
      return;
    }

    setEnviando(true);

    try {
      await aoCriar({ titulo, descricao, modalidade, precoCentavos });
      setTitulo('');
      setDescricao('');
      setModalidade('ONLINE');
      setPreco('');
      toast('Consultoria cadastrada com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">Nova consultoria</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Cadastre como produto avulso, com modalidade e valor definido.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={criar}>
          <Campo
            rotulo="Título"
            name="consultoria-titulo"
            placeholder="Ex.: Consultoria Nutricional Individual"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <CampoArea
            rotulo="Descrição (opcional)"
            name="consultoria-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={2000}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect
              rotulo="Modalidade"
              value={modalidade}
              onChange={(v) => setModalidade(v as ModalidadeConsultoria)}
            >
              <option value="ONLINE">Online</option>
              <option value="PRESENCIAL">Presencial</option>
            </CampoSelect>
            <Campo
              rotulo="Valor"
              name="consultoria-preco"
              placeholder="0,00"
              inputMode="numeric"
              value={preco}
              onChange={(e) => setPreco(mascararReais(e.target.value))}
              required
            />
          </div>

          <Botao type="submit" carregando={enviando}>
            {enviando ? 'Salvando...' : 'Adicionar consultoria'}
          </Botao>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {consultorias.length} consultoria{consultorias.length !== 1 ? 's' : ''}
          </p>
        </div>

        {consultorias.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma consultoria cadastrada"
            descricao="Use o formulário acima para cadastrar seus serviços."
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {consultorias.map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                <div>
                  <p className="font-medium text-slate-800">{c.titulo}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge cor={c.modalidade === 'ONLINE' ? 'azul' : 'ciano'}>
                      {c.modalidade === 'ONLINE' ? 'Online' : 'Presencial'}
                    </Badge>
                    {c.descricao && (
                      <p className="text-sm text-slate-500">{c.descricao}</p>
                    )}
                  </div>
                </div>
                <span className="rounded-xl bg-teal-50 px-3 py-1 text-sm font-semibold text-primario">
                  {formatarReais(c.precoCentavos)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
