import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Campo } from '../componentes/ui/Campo';
import { Botao } from '../componentes/ui/Botao';
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
        <h2 className="text-xl font-bold text-slate-900">Criar conta</h2>
        <p className="mt-1 text-sm text-slate-500">Comece com o plano gratuito, sem cartão.</p>
      </div>

      <Campo
        rotulo="Nome profissional"
        name="nome"
        placeholder="Dra. Ana Lima"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
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
        rotulo="Endereço da sua página"
        name="slug"
        placeholder="ana-lima"
        ajuda="Será o link público do seu perfil: nurseflow.com/ana-lima"
        value={slug}
        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
        required
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      <Botao type="submit" larguraTotal tamanho="lg" carregando={enviando}>
        {enviando ? 'Criando conta...' : 'Criar conta grátis'}
      </Botao>

      <p className="text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link className="font-semibold text-primario hover:text-primario-800" to="/autenticacao/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
