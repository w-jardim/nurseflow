import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampoTexto } from '../componentes/CampoTexto';
import { requisitarApi } from '../servicos/api';
import { salvarToken } from '../servicos/sessao';
import type { RespostaAutenticacao } from '../tipos/autenticacao';

export function PaginaLogin() {
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const resposta = await requisitarApi<RespostaAutenticacao>('/autenticacao/login', {
        metodo: 'POST',
        corpo: { email, senha },
      });

      salvarToken(resposta.acesso.token);
      navegar(resposta.usuario.papel === 'SUPER_ADMIN' ? '/admin' : '/painel');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Entrar</h2>
        <p className="mt-2 text-sm text-slate-600">Use seu e-mail profissional para acessar.</p>
      </div>

      <CampoTexto
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        required
      />
      <CampoTexto
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        required
      />

      {erro ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p> : null}

      <button
        className="h-11 w-full rounded-md bg-primario px-4 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={enviando}
        type="submit"
      >
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <Link className="font-semibold text-primario" to="/autenticacao/cadastro">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
