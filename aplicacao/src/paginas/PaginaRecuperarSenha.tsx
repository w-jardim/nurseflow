import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Botao } from '../componentes/ui/Botao';
import { Campo } from '../componentes/ui/Campo';
import { requisitarApi } from '../servicos/api';

type RespostaRecuperarSenha = {
  sucesso: true;
};

const MENSAGEM_SUCESSO =
  'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinir sua senha.';

export function PaginaRecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function solicitarRecuperacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      await requisitarApi<RespostaRecuperarSenha>('/autenticacao/recuperar-senha', {
        metodo: 'POST',
        corpo: { email },
      });

      setSucesso(MENSAGEM_SUCESSO);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível enviar a solicitação.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={solicitarRecuperacao} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Recuperar senha</h2>
        <p className="mt-1 text-sm text-slate-500">
          Informe seu e-mail profissional para receber as instruções de redefinição.
        </p>
      </div>

      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {sucesso && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">{sucesso}</p>
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <Botao type="submit" larguraTotal tamanho="lg" carregando={enviando}>
        {enviando ? 'Enviando...' : 'Enviar instruções'}
      </Botao>

      <p className="text-center text-sm text-slate-500">
        Lembrou sua senha?{' '}
        <Link className="font-semibold text-primario hover:text-primario-800" to="/autenticacao/login">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
