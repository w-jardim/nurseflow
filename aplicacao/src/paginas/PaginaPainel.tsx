import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PainelConsultorias } from '../componentes/PainelConsultorias';
import { PainelConteudoCurso } from '../componentes/PainelConteudoCurso';
import { PainelContatos } from '../componentes/PainelContatos';
import { PainelCursos } from '../componentes/PainelCursos';
import { PainelPerfilProfissional } from '../componentes/PainelPerfilProfissional';
import { requisitarApi } from '../servicos/api';
import { limparToken } from '../servicos/sessao';
import type { Usuario } from '../tipos/autenticacao';
import type { Contato } from '../tipos/contatos';
import type { Consultoria, ModalidadeConsultoria } from '../tipos/consultorias';
import type { Curso, ModalidadeCurso, StatusCurso } from '../tipos/cursos';
import type { PerfilProfissional } from '../tipos/profissionais';

export function PaginaPainel() {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [alunos, setAlunos] = useState<Contato[]>([]);
  const [pacientes, setPacientes] = useState<Contato[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [consultorias, setConsultorias] = useState<Consultoria[]>([]);
  const [perfil, setPerfil] = useState<PerfilProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      requisitarApi<{ usuario: Usuario }>('/autenticacao/me', { autenticada: true }),
      requisitarApi<Contato[]>('/alunos', { autenticada: true }),
      requisitarApi<Contato[]>('/pacientes', { autenticada: true }),
      requisitarApi<Curso[]>('/cursos', { autenticada: true }),
      requisitarApi<Consultoria[]>('/consultorias', { autenticada: true }),
      requisitarApi<PerfilProfissional>('/profissionais/me', { autenticada: true }),
    ])
      .then(([sessao, listaAlunos, listaPacientes, listaCursos, listaConsultorias, perfilProfissional]) => {
        setUsuario(sessao.usuario);
        setAlunos(listaAlunos);
        setPacientes(listaPacientes);
        setCursos(listaCursos);
        setConsultorias(listaConsultorias);
        setPerfil(perfilProfissional);
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

  async function criarAluno(dados: {
    nome: string;
    sobrenome: string;
    cpf: string;
    email: string;
    telefone: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) {
    const aluno = await requisitarApi<Contato>('/alunos', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        cpf: dados.cpf,
        email: dados.email,
        telefone: dados.telefone || undefined,
      },
    });
    setAlunos((atuais) => [aluno, ...atuais]);
  }

  async function salvarPerfil(dados: {
    nomePublico: string;
    slug: string;
    bio: string;
    telefone: string;
    conselho: string;
  }) {
    const perfilAtualizado = await requisitarApi<PerfilProfissional>('/profissionais/me', {
      metodo: 'PUT',
      autenticada: true,
      corpo: {
        nomePublico: dados.nomePublico,
        slug: dados.slug,
        bio: dados.bio || undefined,
        telefone: dados.telefone || undefined,
        conselho: dados.conselho || undefined,
      },
    });

    setPerfil(perfilAtualizado);
  }

  async function criarPaciente(dados: {
    nome: string;
    sobrenome: string;
    cpf: string;
    email: string;
    telefone: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) {
    const paciente = await requisitarApi<Contato>('/pacientes', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        cpf: dados.cpf,
        email: dados.email || undefined,
        telefone: dados.telefone || undefined,
        cep: dados.cep || undefined,
        logradouro: dados.logradouro || undefined,
        numero: dados.numero || undefined,
        complemento: dados.complemento || undefined,
        bairro: dados.bairro || undefined,
        cidade: dados.cidade || undefined,
        uf: dados.uf || undefined,
      },
    });
    setPacientes((atuais) => [paciente, ...atuais]);
  }

  async function criarCurso(dados: {
    titulo: string;
    slug: string;
    descricao: string;
    modalidade: ModalidadeCurso;
    precoCentavos: number;
    status: StatusCurso;
  }) {
    const curso = await requisitarApi<Curso>('/cursos', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        titulo: dados.titulo,
        slug: dados.slug,
        descricao: dados.descricao || undefined,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
        status: dados.status,
      },
    });
    setCursos((atuais) => [curso, ...atuais]);
  }

  async function criarConsultoria(dados: {
    titulo: string;
    descricao: string;
    modalidade: ModalidadeConsultoria;
    precoCentavos: number;
  }) {
    const consultoria = await requisitarApi<Consultoria>('/consultorias', {
      metodo: 'POST',
      autenticada: true,
      corpo: {
        titulo: dados.titulo,
        descricao: dados.descricao || undefined,
        modalidade: dados.modalidade,
        precoCentavos: dados.precoCentavos,
      },
    });
    setConsultorias((atuais) => [consultoria, ...atuais]);
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

        <div className="mt-8">
          <PainelPerfilProfissional perfil={perfil} aoSalvar={salvarPerfil} />
        </div>

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
            coletarEndereco
            aoCriar={criarPaciente}
          />
        </div>

        <div className="mt-4">
          <PainelCursos cursos={cursos} aoCriar={criarCurso} />
        </div>

        <div className="mt-4">
          <PainelConteudoCurso cursos={cursos} />
        </div>

        <div className="mt-4">
          <PainelConsultorias consultorias={consultorias} aoCriar={criarConsultoria} />
        </div>
      </section>
    </main>
  );
}
