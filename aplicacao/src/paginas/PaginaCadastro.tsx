import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampoTexto } from '../componentes/CampoTexto';
import { requisitarApi } from '../servicos/api';
import { salvarToken } from '../servicos/sessao';
import type { RespostaAutenticacao } from '../tipos/autenticacao';

export function PaginaCadastro() {
  const navegar = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [slug, setSlug] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const resposta = await requisitarApi<RespostaAutenticacao>('/autenticacao/cadastro-profissional', {
        metodo: 'POST',
        corpo: { nome, email, senha, slug },
      });

      salvarToken(resposta.acesso.token);
      navegar('/painel');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={cadastrar} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Criar conta</h2>
        <p className="mt-2 text-sm text-slate-600">Comece com o plano gratuito.</p>
      </div>

      <CampoTexto
        rotulo="Nome profissional"
        name="nome"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        required
      />
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
        rotulo="Slug da página"
        name="slug"
        placeholder="profissional-saude"
        value={slug}
        onChange={(evento) => setSlug(evento.target.value.toLowerCase())}
        required
      />
      <CampoTexto
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
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
        {enviando ? 'Criando...' : 'Criar conta'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link className="font-semibold text-primario" to="/autenticacao/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
