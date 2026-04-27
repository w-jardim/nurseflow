import { FormEvent, useEffect, useState } from 'react';
import { Campo, CampoArea } from './ui/Campo';
import { Botao } from './ui/Botao';
import { useToast } from '../contextos/ToastContexto';
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

function normalizarSlug(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function PainelPerfilProfissional({ perfil, aoSalvar }: PainelPerfilProfissionalProps) {
  const toast = useToast();
  const [nomePublico, setNomePublico] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [conselho, setConselho] = useState('');
  const [pixChave, setPixChave] = useState('');
  const [linkPagamento, setLinkPagamento] = useState('');
  const [instrucoesPagamento, setInstrucoesPagamento] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!perfil) return;
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
    setEnviando(true);

    try {
      await aoSalvar({ nomePublico, slug, bio, telefone, conselho, pixChave, linkPagamento, instrucoesPagamento });
      toast('Perfil salvo com sucesso.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="font-semibold text-slate-800">Perfil público</h2>
          <p className="mt-0.5 text-sm text-slate-500">Dados que aparecem na sua página profissional.</p>
        </div>
        {slug && (
          <a
            className="flex items-center gap-1.5 text-sm font-medium text-primario hover:text-primario-800"
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver página
          </a>
        )}
      </div>

      <form className="divide-y divide-slate-100" onSubmit={salvar}>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Campo
            rotulo="Nome público"
            name="perfil-nome-publico"
            value={nomePublico}
            onChange={(e) => {
              setNomePublico(e.target.value);
              if (!slug) setSlug(normalizarSlug(e.target.value));
            }}
            required
          />
          <Campo
            rotulo="Endereço da página"
            name="perfil-slug"
            placeholder="seu-nome"
            ajuda="nurseflow.com/seu-nome"
            value={slug}
            onChange={(e) => setSlug(normalizarSlug(e.target.value))}
            required
          />
          <Campo
            rotulo="Telefone profissional"
            name="perfil-telefone"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
          />
          <Campo
            rotulo="Conselho profissional"
            name="perfil-conselho"
            placeholder="COREN, CRP, CREFITO..."
            value={conselho}
            onChange={(e) => setConselho(e.target.value)}
          />
          <div className="sm:col-span-2">
            <CampoArea
              rotulo="Apresentação"
              name="perfil-bio"
              placeholder="Escreva uma apresentação para os visitantes da sua página..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
            />
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Recebimento direto
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              rotulo="Chave PIX"
              name="perfil-pix-chave"
              placeholder="CPF, e-mail, telefone ou aleatória"
              value={pixChave}
              onChange={(e) => setPixChave(e.target.value)}
            />
            <Campo
              rotulo="Link de pagamento"
              name="perfil-link-pagamento"
              type="url"
              placeholder="https://..."
              value={linkPagamento}
              onChange={(e) => setLinkPagamento(e.target.value)}
            />
            <div className="sm:col-span-2">
              <CampoArea
                rotulo="Instruções de pagamento"
                name="perfil-instrucoes"
                placeholder="Ex.: envie o comprovante pelo WhatsApp após o pagamento."
                value={instrucoesPagamento}
                onChange={(e) => setInstrucoesPagamento(e.target.value)}
                maxLength={1000}
                className="min-h-16"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4">
          <Botao type="submit" carregando={enviando}>
            {enviando ? 'Salvando...' : 'Salvar perfil'}
          </Botao>
        </div>
      </form>
    </div>
  );
}
