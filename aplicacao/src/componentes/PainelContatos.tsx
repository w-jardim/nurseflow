import { FormEvent, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { Contato } from '../tipos/contatos';

type PainelContatosProps = {
  titulo: string;
  descricao: string;
  contatos: Contato[];
  emailObrigatorio?: boolean;
  aoCriar: (dados: { nome: string; email: string; telefone: string }) => Promise<void>;
};

export function PainelContatos({
  titulo,
  descricao,
  contatos,
  emailObrigatorio = false,
  aoCriar,
}: PainelContatosProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await aoCriar({ nome, email, telefone });
      setNome('');
      setEmail('');
      setTelefone('');
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
          value={telefone}
          onChange={(evento) => setTelefone(evento.target.value)}
        />

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
                <p className="font-medium">{contato.nome}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {[contato.email, contato.telefone].filter(Boolean).join(' · ') || 'Sem contato informado'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
