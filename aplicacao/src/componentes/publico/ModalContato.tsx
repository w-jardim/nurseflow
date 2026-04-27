import { FormEvent, useState } from 'react';
import { Campo, CampoArea } from '../ui/Campo';
import { Botao } from '../ui/Botao';
import { requisitarApi } from '../../servicos/api';
import { mascararTelefone } from '../../utilitarios/mascaras';

export type InteresseItem = {
  origem: 'PERFIL' | 'CURSO' | 'CONSULTORIA' | 'SERVICO';
  titulo: string;
  cursoId?: string;
  consultoriaId?: string;
  servicoId?: string;
};

type Props = {
  slug: string;
  interesse: InteresseItem;
  aoFechar: () => void;
};

export function ModalContato({ slug, interesse, aoFechar }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await requisitarApi(`/publico/profissionais/${slug}/interesses`, {
        metodo: 'POST',
        corpo: {
          nome,
          email,
          telefone: telefone || undefined,
          mensagem: mensagem || undefined,
          origem: interesse.origem,
          cursoId: interesse.cursoId,
          consultoriaId: interesse.consultoriaId,
          servicoId: interesse.servicoId,
        },
      });
      setEnviado(true);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível registrar o interesse.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) aoFechar(); }}
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primario">Demonstrar interesse</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{interesse.titulo}</h3>
          </div>
          <button
            onClick={aoFechar}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {enviado ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                <svg className="h-7 w-7 text-primario" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Interesse registrado!</h3>
              <p className="mt-2 text-sm text-slate-500">O profissional entrará em contato em breve.</p>
              <button
                className="mt-5 text-sm font-semibold text-primario hover:underline"
                onClick={aoFechar}
                type="button"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={enviar}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Nome" name="c-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                <Campo rotulo="E-mail" name="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Campo
                rotulo="Telefone (opcional)"
                name="c-telefone"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              />
              <CampoArea
                rotulo="Mensagem (opcional)"
                name="c-mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                maxLength={1000}
              />
              {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
              <Botao type="submit" carregando={enviando} larguraTotal>
                {enviando ? 'Enviando...' : 'Enviar interesse'}
              </Botao>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
