import { FormEvent, useState } from 'react';
import { Campo } from './ui/Campo';
import { Botao } from './ui/Botao';
import { EstadoVazio } from './ui/EstadoVazio';
import { useToast } from '../contextos/ToastContexto';
import type { Contato } from '../tipos/contatos';
import { mascararCep, mascararCpf, mascararTelefone } from '../utilitarios/mascaras';

type PainelContatosProps = {
  titulo: string;
  descricao: string;
  contatos: Contato[];
  emailObrigatorio?: boolean;
  coletarEndereco?: boolean;
  aoCriar: (dados: {
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
  }) => Promise<void>;
};

function iniciais(nome: string, sobrenome: string) {
  return [nome[0], sobrenome[0]].filter(Boolean).join('').toUpperCase();
}

export function PainelContatos({
  titulo,
  descricao,
  contatos,
  emailObrigatorio = false,
  coletarEndereco = false,
  aoCriar,
}: PainelContatosProps) {
  const toast = useToast();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);

    try {
      await aoCriar({ nome, sobrenome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf });
      setNome(''); setSobrenome(''); setCpf(''); setEmail(''); setTelefone('');
      setCep(''); setLogradouro(''); setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setUf('');
      toast(`${titulo} adicionado com sucesso.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  const prefixo = titulo.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">{titulo}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>
        </div>

        <form className="grid gap-4" onSubmit={criar}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Nome"
              name={`${prefixo}-nome`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <Campo
              rotulo="Sobrenome"
              name={`${prefixo}-sobrenome`}
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="CPF"
              name={`${prefixo}-cpf`}
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(mascararCpf(e.target.value))}
              required
            />
            <Campo
              rotulo="Telefone"
              name={`${prefixo}-telefone`}
              inputMode="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
            />
          </div>
          <Campo
            rotulo={emailObrigatorio ? 'E-mail' : 'E-mail (opcional)'}
            name={`${prefixo}-email`}
            type="email"
            placeholder="contato@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={emailObrigatorio}
          />

          {coletarEndereco && (
            <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Campo
                rotulo="CEP"
                name={`${prefixo}-cep`}
                inputMode="numeric"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(mascararCep(e.target.value))}
              />
              <Campo
                rotulo="UF"
                name={`${prefixo}-uf`}
                placeholder="SP"
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
              />
              <Campo
                rotulo="Logradouro"
                name={`${prefixo}-logradouro`}
                placeholder="Rua, avenida ou praça"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
              />
              <Campo
                rotulo="Número"
                name={`${prefixo}-numero`}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
              <Campo
                rotulo="Complemento"
                name={`${prefixo}-complemento`}
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
              <Campo
                rotulo="Bairro"
                name={`${prefixo}-bairro`}
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Campo
                  rotulo="Cidade"
                  name={`${prefixo}-cidade`}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
            </div>
          )}

          <Botao type="submit" carregando={enviando} tamanho="md">
            {enviando ? 'Salvando...' : `Adicionar ${titulo.toLowerCase()}`}
          </Botao>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {contatos.length} {titulo.toLowerCase()}{contatos.length !== 1 ? 's' : ''} cadastrado{contatos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {contatos.length === 0 ? (
          <EstadoVazio
            titulo={`Nenhum ${titulo.toLowerCase()} ainda`}
            descricao={`Preencha o formulário acima para cadastrar.`}
            icone={
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {contatos.map((contato) => (
              <li key={contato.id} className="flex items-start gap-4 px-6 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-primario">
                  {iniciais(contato.nome, contato.sobrenome ?? '')}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">
                    {[contato.nome, contato.sobrenome].filter(Boolean).join(' ')}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {[
                      contato.cpf ? mascararCpf(contato.cpf) : null,
                      contato.email,
                      contato.telefone ? mascararTelefone(contato.telefone) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Sem contato informado'}
                  </p>
                  {coletarEndereco && contato.cep && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {[contato.logradouro, contato.numero, contato.bairro, contato.cidade, contato.uf]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
