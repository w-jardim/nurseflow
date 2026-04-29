import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Botao } from '../componentes/ui/Botao';
import { Campo } from '../componentes/ui/Campo';
import { requisitarApi } from '../servicos/api';

type RespostaRedefinirSenha = {
  sucesso: true;
};

const MENSAGEM_ERRO_LINK = 'Link inválido ou expirado.';
const MENSAGEM_SUCESSO = 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.';
const SENHA_MINIMA = 8;

export function PaginaRedefinirSenha() {
  const navegar = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function redefinirSenha(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setSucesso('');

    if (!token) {
      setErro(MENSAGEM_ERRO_LINK);
      return;
    }

    if (novaSenha.length < SENHA_MINIMA) {
      setErro(`A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setEnviando(true);

    try {
      await requisitarApi<RespostaRedefinirSenha>('/autenticacao/redefinir-senha', {
        metodo: 'POST',
        corpo: {
          token,
          novaSenha,
        },
      });

      setSucesso(MENSAGEM_SUCESSO);
      setTimeout(() => {
        navegar('/autenticacao/login');
      }, 1500);
    } catch {
      setErro(MENSAGEM_ERRO_LINK);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={redefinirSenha} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Definir nova senha</h2>
        <p className="mt-1 text-sm text-slate-500">
          Escolha uma nova senha para voltar a acessar sua conta com segurança.
        </p>
      </div>

      <Campo
        rotulo="Nova senha"
        name="novaSenha"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        required
      />

      <Campo
        rotulo="Confirmar nova senha"
        name="confirmarSenha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita sua nova senha"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
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
        {enviando ? 'Salvando...' : 'Redefinir senha'}
      </Botao>

      <p className="text-center text-sm text-slate-500">
        Voltar para{' '}
        <Link className="font-semibold text-primario hover:text-primario-800" to="/autenticacao/login">
          entrar
        </Link>
      </p>
    </form>
  );
}
