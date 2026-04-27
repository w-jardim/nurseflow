import { FormEvent, useMemo, useState } from 'react';
import { Campo } from './ui/Campo';
import { Botao } from './ui/Botao';
import { Badge } from './ui/Badge';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Contato } from '../tipos/contatos';
import { mascararCep, mascararCpf, mascararTelefone } from '../utilitarios/mascaras';

type DadosContato = {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

type PainelContatosProps = {
  titulo: string;
  descricao: string;
  contatos: Contato[];
  emailObrigatorio?: boolean;
  coletarEndereco?: boolean;
  aoCriar: (dados: DadosContato) => Promise<void>;
};

function iniciais(nome: string, sobrenome: string | null) {
  return [nome[0], sobrenome?.[0]].filter(Boolean).join('').toUpperCase();
}

function nomeCompleto(contato: Contato) {
  return [contato.nome, contato.sobrenome].filter(Boolean).join(' ');
}

function enderecoResumido(contato: Contato) {
  return [contato.logradouro, contato.numero, contato.bairro, contato.cidade, contato.uf].filter(Boolean).join(', ');
}

const formularioInicial: DadosContato = {
  nome: '',
  sobrenome: '',
  cpf: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export function PainelContatos({
  titulo,
  descricao,
  contatos,
  emailObrigatorio = false,
  coletarEndereco = false,
  aoCriar,
}: PainelContatosProps) {
  const toast = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [formulario, setFormulario] = useState<DadosContato>(formularioInicial);
  const [enviando, setEnviando] = useState(false);

  const prefixo = titulo.toLowerCase().replace(/\s/g, '-');
  const plural = `${titulo.toLowerCase()}${contatos.length !== 1 ? 's' : ''}`;
  const contatosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return contatos;

    return contatos.filter((contato) =>
      [
        nomeCompleto(contato),
        contato.email,
        contato.telefone,
        contato.cpf,
        contato.cidade,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo)),
    );
  }, [busca, contatos]);

  function atualizarCampo(campo: keyof DadosContato, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function limparFormulario() {
    setFormulario(formularioInicial);
  }

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      await aoCriar(formulario);
      limparFormulario();
      setModalAberto(false);
      toast(`${titulo} adicionado com sucesso.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{titulo}s</h1>
          <p className="mt-1 text-sm text-slate-500">{descricao}</p>
        </div>
        <Botao onClick={() => setModalAberto(true)}>Adicionar {titulo.toLowerCase()}</Botao>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {contatos.length} {plural} cadastrado{contatos.length !== 1 ? 's' : ''}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Consulte rapidamente dados de contato e endereço.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Campo
              rotulo="Buscar"
              name={`${prefixo}-busca`}
              placeholder="Nome, e-mail, CPF ou telefone"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </div>
        </div>

        {contatos.length === 0 ? (
          <EstadoVazio
            titulo={`Nenhum ${titulo.toLowerCase()} ainda`}
            descricao={`Use o botão para adicionar ${titulo.toLowerCase()} sem ocupar a página com formulário.`}
            acaoRotulo={`Adicionar ${titulo.toLowerCase()}`}
            aoAcionar={() => setModalAberto(true)}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        ) : contatosFiltrados.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">Nenhum resultado para a busca atual.</div>
        ) : (
          <ul className="grid gap-3 p-4 xl:grid-cols-2">
            {contatosFiltrados.map((contato) => (
              <li key={contato.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-primario">
                    {iniciais(contato.nome, contato.sobrenome)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="truncate font-semibold text-slate-950">{nomeCompleto(contato)}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {contato.email ? <Badge cor="azul">{contato.email}</Badge> : null}
                          {contato.telefone ? <Badge cor="ciano">{mascararTelefone(contato.telefone)}</Badge> : null}
                          {contato.cpf ? <Badge>{mascararCpf(contato.cpf)}</Badge> : null}
                        </div>
                      </div>
                    </div>
                    {coletarEndereco && enderecoResumido(contato) ? (
                      <p className="mt-3 text-sm text-slate-500">{enderecoResumido(contato)}</p>
                    ) : null}
                    <p className="mt-3 text-xs text-slate-400">
                      Cadastro em {new Date(contato.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalAberto ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primario">Novo cadastro</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">Adicionar {titulo.toLowerCase()}</h3>
                <p className="mt-1 text-sm text-slate-500">Preencha apenas os dados necessários para seguir o atendimento.</p>
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

            <form className="grid gap-4 px-6 py-5" onSubmit={criar}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  rotulo="Nome"
                  name={`${prefixo}-nome`}
                  value={formulario.nome}
                  onChange={(evento) => atualizarCampo('nome', evento.target.value)}
                  required
                />
                <Campo
                  rotulo="Sobrenome"
                  name={`${prefixo}-sobrenome`}
                  value={formulario.sobrenome}
                  onChange={(evento) => atualizarCampo('sobrenome', evento.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  rotulo="CPF"
                  name={`${prefixo}-cpf`}
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={formulario.cpf}
                  onChange={(evento) => atualizarCampo('cpf', mascararCpf(evento.target.value))}
                  required
                />
                <Campo
                  rotulo="Telefone"
                  name={`${prefixo}-telefone`}
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={formulario.telefone}
                  onChange={(evento) => atualizarCampo('telefone', mascararTelefone(evento.target.value))}
                />
              </div>
              <Campo
                rotulo={emailObrigatorio ? 'E-mail' : 'E-mail opcional'}
                name={`${prefixo}-email`}
                type="email"
                placeholder="contato@email.com"
                value={formulario.email}
                onChange={(evento) => atualizarCampo('email', evento.target.value)}
                required={emailObrigatorio}
              />

              {coletarEndereco ? (
                <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <Campo
                    rotulo="CEP"
                    name={`${prefixo}-cep`}
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={formulario.cep}
                    onChange={(evento) => atualizarCampo('cep', mascararCep(evento.target.value))}
                  />
                  <Campo
                    rotulo="UF"
                    name={`${prefixo}-uf`}
                    placeholder="SP"
                    maxLength={2}
                    value={formulario.uf}
                    onChange={(evento) => atualizarCampo('uf', evento.target.value.toUpperCase())}
                  />
                  <Campo
                    rotulo="Logradouro"
                    name={`${prefixo}-logradouro`}
                    placeholder="Rua, avenida ou praça"
                    value={formulario.logradouro}
                    onChange={(evento) => atualizarCampo('logradouro', evento.target.value)}
                  />
                  <Campo
                    rotulo="Número"
                    name={`${prefixo}-numero`}
                    value={formulario.numero}
                    onChange={(evento) => atualizarCampo('numero', evento.target.value)}
                  />
                  <Campo
                    rotulo="Complemento"
                    name={`${prefixo}-complemento`}
                    value={formulario.complemento}
                    onChange={(evento) => atualizarCampo('complemento', evento.target.value)}
                  />
                  <Campo
                    rotulo="Bairro"
                    name={`${prefixo}-bairro`}
                    value={formulario.bairro}
                    onChange={(evento) => atualizarCampo('bairro', evento.target.value)}
                  />
                  <div className="sm:col-span-2">
                    <Campo
                      rotulo="Cidade"
                      name={`${prefixo}-cidade`}
                      value={formulario.cidade}
                      onChange={(evento) => atualizarCampo('cidade', evento.target.value)}
                    />
                  </div>
                </div>
              ) : null}

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
                  {enviando ? 'Salvando...' : `Adicionar ${titulo.toLowerCase()}`}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
