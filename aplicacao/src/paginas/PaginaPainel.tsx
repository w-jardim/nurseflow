import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PainelContatos } from '../componentes/PainelContatos';
import { requisitarApi } from '../servicos/api';
import { limparToken } from '../servicos/sessao';
import type { Usuario } from '../tipos/autenticacao';
import type { Contato } from '../tipos/contatos';

export function PaginaPainel() {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [alunos, setAlunos] = useState<Contato[]>([]);
  const [pacientes, setPacientes] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      requisitarApi<{ usuario: Usuario }>('/autenticacao/me', { autenticada: true }),
      requisitarApi<Contato[]>('/alunos', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
    ])
      .then(([sessao, listaAlunos, listaPacientes]) => {
        setUsuario(sessao.usuario);
        setAlunos(listaAlunos);
        setPacientes(listaPacientes);
      })
      .catch(() => {
        limparToken();
        navegar('/autenticacao/login');
      })
      .finally(() => setCarregando(false));
  }, [navegar]);

  function sair() {
    limparToken();
    navegar('/autenticacao/login');
  }

  async function criarAluno(dados: { nome: string; email: string; telefone: string }) {
    const aluno = await requisitarApi<Contato>('/alunos', {
      metodo: 'POST',
      autenticada: true,
      corpo: dados,
    });
    setAlunos((atuais) => [aluno, ...atuais]);
  }

  async function criarPaciente(dados: { nome: string; email: string; telefone: string }) {
    const paciente = await requisitarApi<Contato>('/pacientes', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        nome: dados.nome,
        email: dados.email || undefined,
        telefone: dados.telefone || undefined,
      },
    });
    setPacientes((atuais) => [paciente, ...atuais]);
  }

  if (carregando) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
        <p>Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-tinta">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-bold text-primario">
            NurseFlow
          </Link>
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primario">Painel</p>
        <h1 className="mt-3 text-3xl font-bold">Olá, {usuario?.nome}</h1>
        <p className="mt-2 text-slate-700">
          Sessão autenticada como {usuario?.papel}. Tenant atual: {usuario?.profissionalId}.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <PainelContatos
            titulo="Aluno"
            descricao="Cadastre alunos para cursos e acompanhamento."
            contatos={alunos}
            emailObrigatorio
            aoCriar={criarAluno}
          />
          <PainelContatos
            titulo="Paciente"
            descricao="Cadastre pacientes para atendimentos e agenda."
            contatos={pacientes}
            aoCriar={criarPaciente}
          />
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Cursos</h2>
          <p className="mt-2 text-sm text-slate-600">Módulo preparado para a próxima fatia da Fase 1.</p>
        </div>
      </section>
    </main>
  );
}
