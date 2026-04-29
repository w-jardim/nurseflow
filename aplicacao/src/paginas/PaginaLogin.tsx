import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Campo } from '../componentes/ui/Campo';
import { Botao } from '../componentes/ui/Botao';
import { requisitarApi } from '../servicos/api';
import { salvarSessao } from '../servicos/sessao';
import type { RespostaAutenticacao } from '../tipos/autenticacao';

function rotaInicialPorPapel(papel: RespostaAutenticacao['usuario']['papel']) {
  if (papel === 'SUPER_ADMIN') return '/admin';
  if (papel === 'ALUNO') return '/aluno/cursos';
  return '/painel';
}

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

      salvarSessao(resposta);
      navegar(rotaInicialPorPapel(resposta.usuario.papel));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Entrar na conta</h2>
        <p className="mt-1 text-sm text-slate-500">Use seu e-mail profissional para acessar.</p>
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
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      <div className="flex justify-end">
        <Link
          className="text-sm font-semibold text-primario transition hover:text-primario-800"
          to="/autenticacao/recuperar-senha"
        >
          Esqueci minha senha
        </Link>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <Botao type="submit" larguraTotal tamanho="lg" carregando={enviando}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </Botao>

      <p className="text-center text-sm text-slate-500">
        Ainda não tem conta?{' '}
        <Link className="font-semibold text-primario hover:text-primario-800" to="/autenticacao/cadastro">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}
