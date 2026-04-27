import { FormEvent, useState } from 'react';
import { Campo, CampoArea } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Servico } from '../tipos/servicos';
import { formatarReais, mascararReais, reaisParaCentavos } from '../utilitarios/moeda';

const PRECO_MAXIMO_CENTAVOS = 100000000;

type DadosServico = {
  titulo: string;
  descricao: string;
  precoCentavos: number;
  exibirPreco: boolean;
  publicado: boolean;
};

type PainelServicosProps = {
  servicos: Servico[];
  aoCriar: (dados: DadosServico) => Promise<void>;
  aoAtualizar: (id: string, dados: DadosServico) => Promise<void>;
  aoExcluir: (id: string) => Promise<void>;
};

export function PainelServicos({ servicos, aoCriar, aoAtualizar, aoExcluir }: PainelServicosProps) {
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [servicoExcluindo, setServicoExcluindo] = useState<Servico | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [exibirPreco, setExibirPreco] = useState(true);
  const [publicado, setPublicado] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function limparFormulario() {
    setTitulo('');
    setDescricao('');
    setPreco('');
    setExibirPreco(true);
    setPublicado(true);
    setServicoEditando(null);
  }

  function abrirNovoServico() {
    limparFormulario();
    setModalAberto(true);
  }

  function abrirEdicao(servico: Servico) {
    setServicoEditando(servico);
    setTitulo(servico.titulo);
    setDescricao(servico.descricao ?? '');
    setPreco(mascararReais(String(servico.precoCentavos)));
    setExibirPreco(servico.exibirPreco);
    setPublicado(servico.publicado);
    setModalAberto(true);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const precoCentavos = reaisParaCentavos(preco);

    if (precoCentavos > PRECO_MAXIMO_CENTAVOS) {
      toast(`Preço máximo: ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`, 'aviso');
      return;
    }

    setEnviando(true);
    try {
      const dados = { titulo, descricao, precoCentavos, exibirPreco, publicado };
      if (servicoEditando) {
        await aoAtualizar(servicoEditando.id, dados);
        toast('Serviço atualizado com sucesso.');
      } else {
        await aoCriar(dados);
        toast('Serviço cadastrado com sucesso.');
      }
      limparFormulario();
      setModalAberto(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o serviço.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarExclusao() {
    if (!servicoExcluindo) return;

    setExcluindo(true);
    try {
      await aoExcluir(servicoExcluindo.id);
      setServicoExcluindo(null);
      toast('Serviço excluído.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível excluir o serviço.', 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Serviços</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monte seu catálogo público com valores visíveis ou sob consulta.
          </p>
        </div>
        <Botao onClick={abrirNovoServico}>Novo serviço</Botao>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {servicos.length} serviço{servicos.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Badge cor="verde">{servicos.filter((servico) => servico.publicado).length} públicos</Badge>
            <Badge>{servicos.filter((servico) => !servico.publicado).length} ocultos</Badge>
          </div>
        </div>

        {servicos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum serviço cadastrado"
            descricao="Crie serviços para mostrar na sua página pública."
            acaoRotulo="Novo serviço"
            aoAcionar={abrirNovoServico}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h6m-6 4h6m-6 4h3m-7 6h14a2 2 0 002-2V6.5L16.5 2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <ul className="grid gap-3 p-4 lg:grid-cols-2">
            {servicos.map((servico) => (
              <li key={servico.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{servico.titulo}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge cor={servico.publicado ? 'verde' : 'cinza'}>
                        {servico.publicado ? 'Publicado' : 'Oculto'}
                      </Badge>
                      <Badge cor={servico.exibirPreco ? 'ciano' : 'amarelo'}>
                        {servico.exibirPreco ? formatarReais(servico.precoCentavos) : 'Valor sob consulta'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {servico.descricao ? <p className="mt-3 text-sm text-slate-500">{servico.descricao}</p> : null}
                <div className="mt-4 flex justify-end gap-2">
                  <Botao tamanho="sm" variante="fantasma" onClick={() => abrirEdicao(servico)}>
                    Editar
                  </Botao>
                  <Botao tamanho="sm" variante="perigo" onClick={() => setServicoExcluindo(servico)}>
                    Excluir
                  </Botao>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalAberto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">
                  {servicoEditando ? 'Editar serviço' : 'Novo serviço'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {servicoEditando ? 'Atualizar catálogo' : 'Criar serviço'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">Defina como este serviço aparece na página pública.</p>
              </div>
              <button
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  setModalAberto(false);
                  limparFormulario();
                }}
                type="button"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </div>

            <form className="grid gap-4 px-6 py-5" onSubmit={salvar}>
              <Campo
                rotulo="Título"
                name="servico-titulo"
                value={titulo}
                onChange={(evento) => setTitulo(evento.target.value)}
                required
              />
              <CampoArea
                rotulo="Descrição"
                name="servico-descricao"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
                maxLength={2000}
              />
              <Campo
                rotulo="Valor"
                name="servico-preco"
                placeholder="0,00"
                inputMode="numeric"
                value={preco}
                onChange={(evento) => setPreco(mascararReais(evento.target.value))}
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primario focus:ring-teal-100"
                    checked={exibirPreco}
                    onChange={(evento) => setExibirPreco(evento.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Exibir valor</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Desmarque para mostrar “sob consulta”.</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primario focus:ring-teal-100"
                    checked={publicado}
                    onChange={(evento) => setPublicado(evento.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Mostrar na página</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Controle a vitrine pública do serviço.</span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <Botao
                  type="button"
                  variante="fantasma"
                  onClick={() => {
                    setModalAberto(false);
                    limparFormulario();
                  }}
                >
                  Cancelar
                </Botao>
                <Botao type="submit" carregando={enviando}>
                  {enviando ? 'Salvando...' : servicoEditando ? 'Salvar alterações' : 'Criar serviço'}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {servicoExcluindo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Excluir serviço</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">{servicoExcluindo.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                O serviço será removido da página pública e arquivado no sistema.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
              <Botao type="button" variante="fantasma" onClick={() => setServicoExcluindo(null)}>
                Cancelar
              </Botao>
              <Botao type="button" variante="perigo" carregando={excluindo} onClick={() => void confirmarExclusao()}>
                {excluindo ? 'Excluindo...' : 'Excluir serviço'}
              </Botao>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
