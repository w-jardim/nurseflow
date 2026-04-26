import { FormEvent, useEffect, useState } from 'react';
import { CampoTexto } from './CampoTexto';
import type { PerfilProfissional } from '../tipos/profissionais';
import { mascararTelefone } from '../utilitarios/mascaras';

type PainelPerfilProfissionalProps = {
  perfil: PerfilProfissional | null;
  aoSalvar: (dados: {
    nomePublico: string;
    slug: string;
    bio: string;
    telefone: string;
    conselho: string;
    pixChave: string;
    linkPagamento: string;
    instrucoesPagamento: string;
  }) => Promise<void>;
};

function normalizarEndereco(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function PainelPerfilProfissional({ perfil, aoSalvar }: PainelPerfilProfissionalProps) {
  const [nomePublico, setNomePublico] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [conselho, setConselho] = useState('');
  const [pixChave, setPixChave] = useState('');
  const [linkPagamento, setLinkPagamento] = useState('');
  const [instrucoesPagamento, setInstrucoesPagamento] = useState('');
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!perfil) {
      return;
    }

    setNomePublico(perfil.nomePublico);
    setSlug(perfil.slug);
    setBio(perfil.bio ?? '');
    setTelefone(perfil.telefone ? mascararTelefone(perfil.telefone) : '');
    setConselho(perfil.conselho ?? '');
    setPixChave(perfil.pixChave ?? '');
    setLinkPagamento(perfil.linkPagamento ?? '');
    setInstrucoesPagamento(perfil.instrucoesPagamento ?? '');
  }, [perfil]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setSalvo(false);
    setEnviando(true);

    try {
      await aoSalvar({
        nomePublico,
        slug,
        bio,
        telefone,
        conselho,
        pixChave,
        linkPagamento,
        instrucoesPagamento,
      });
      setSalvo(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Perfil público</h2>
          <p className="mt-1 text-sm text-slate-600">Dados que aparecem na sua página profissional.</p>
        </div>
        {slug ? (
          <a className="text-sm font-semibold text-primario hover:text-teal-800" href={`/${slug}`}>
            Ver página
          </a>
        ) : null}
      </div>

      <form className="mt-5 grid gap-3" onSubmit={salvar}>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Nome público"
            name="perfil-nome-publico"
            value={nomePublico}
            onChange={(evento) => {
              const valor = evento.target.value;
              setNomePublico(valor);
              if (!slug) {
                setSlug(normalizarEndereco(valor));
              }
            }}
            required
          />
          <CampoTexto
            rotulo="Endereço da sua página"
            name="perfil-endereco-pagina"
            placeholder="seu-nome"
            value={slug}
            onChange={(evento) => setSlug(normalizarEndereco(evento.target.value))}
            required
          />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Apresentação</span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
            value={bio}
            onChange={(evento) => setBio(evento.target.value)}
            maxLength={2000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Telefone profissional"
            name="perfil-telefone"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(evento) => setTelefone(mascararTelefone(evento.target.value))}
          />
          <CampoTexto
            rotulo="Conselho profissional"
            name="perfil-conselho"
            placeholder="COREN, CRP, CREFITO..."
            value={conselho}
            onChange={(evento) => setConselho(evento.target.value)}
          />
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recebimento direto</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <CampoTexto
              rotulo="Chave PIX"
              name="perfil-pix-chave"
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              value={pixChave}
              onChange={(evento) => setPixChave(evento.target.value)}
            />
            <CampoTexto
              rotulo="Link de pagamento"
              name="perfil-link-pagamento"
              placeholder="https://..."
              type="url"
              value={linkPagamento}
              onChange={(evento) => setLinkPagamento(evento.target.value)}
            />
          </div>
          <label className="mt-3 block">
            <span className="text-sm font-medium text-slate-800">Instruções de pagamento</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primario focus:ring-2 focus:ring-teal-100"
              value={instrucoesPagamento}
              onChange={(evento) => setInstrucoesPagamento(evento.target.value)}
              maxLength={1000}
              placeholder="Ex.: envie o comprovante pelo WhatsApp após o pagamento."
            />
          </label>
        </div>

        {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}
        {salvo ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Perfil salvo.</p> : null}

        <button
          className="h-10 rounded-md bg-primario px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={enviando}
          type="submit"
        >
          {enviando ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
    </article>
  );
}
