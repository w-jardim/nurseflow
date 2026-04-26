import { FormEvent, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Contato } from '../tipos/contatos';
import { mascararCpf, mascararTelefone } from '../utilitarios/mascaras';

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
    endereco: string;
  }) => Promise<void>;
};

export function PainelContatos({
  titulo,
  descricao,
  contatos,
  emailObrigatorio = false,
  coletarEndereco = false,
  aoCriar,
}: PainelContatosProps) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await aoCriar({ nome, sobrenome, cpf, email, telefone, endereco });
      setNome('');
      setSobrenome('');
      setCpf('');
      setEmail('');
      setTelefone('');
      setEndereco('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-600">{descricao}</p>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={criar}>
        <CampoTexto
          rotulo="Nome"
          name={`${titulo}-nome`}
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          required
        />
        <CampoTexto
          rotulo="Sobrenome"
          name={`${titulo}-sobrenome`}
          value={sobrenome}
          onChange={(evento) => setSobrenome(evento.target.value)}
          required
        />
        <CampoTexto
          rotulo="CPF"
          name={`${titulo}-cpf`}
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(evento) => setCpf(mascararCpf(evento.target.value))}
          required
        />
        <CampoTexto
          rotulo={emailObrigatorio ? 'E-mail' : 'E-mail opcional'}
          name={`${titulo}-email`}
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required={emailObrigatorio}
        />
        <CampoTexto
          rotulo="Telefone opcional"
          name={`${titulo}-telefone`}
          inputMode="tel"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(evento) => setTelefone(mascararTelefone(evento.target.value))}
        />
        {coletarEndereco ? (
          <CampoTexto
            rotulo="Endereço do paciente"
            name={`${titulo}-endereco`}
            placeholder="Rua, número, bairro e cidade"
            value={endereco}
            onChange={(evento) => setEndereco(evento.target.value)}
          />
        ) : null}

        {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

        <button
          className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviando}
          type="submit"
        >
          {enviando ? 'Salvando...' : `Adicionar ${titulo.toLowerCase()}`}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {contatos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum registro cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {contatos.map((contato) => (
              <li key={contato.id} className="rounded-md bg-slate-50 px-3 py-3">
                <p className="font-medium">
                  {[contato.nome, contato.sobrenome].filter(Boolean).join(' ')}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {[
                    contato.cpf ? mascararCpf(contato.cpf) : null,
                    contato.email,
                    contato.telefone ? mascararTelefone(contato.telefone) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Sem contato informado'}
                </p>
                {contato.endereco ? <p className="mt-1 text-sm text-slate-600">{contato.endereco}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
