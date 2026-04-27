import { useEffect, useState } from 'react';
import { PainelContatos } from '../../componentes/PainelContatos';
import { requisitarApi } from '../../servicos/api';
import type { Contato } from '../../tipos/contatos';

export function PaginaAlunos() {
  const [alunos, setAlunos] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<Contato[]>('/alunos', { autenticada: true })
      .then(setAlunos)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarAluno(dados: {
    nome: string; sobrenome: string; cpf: string; email: string;
    telefone: string; cep: string; logradouro: string; numero: string;
    complemento: string; bairro: string; cidade: string; uf: string;
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
    setAlunos((a) => [aluno, ...a]);
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <PainelContatos
      titulo="Aluno"
      descricao="Cadastre alunos para cursos e acompanhamento."
      contatos={alunos}
      emailObrigatorio
      aoCriar={criarAluno}
    />
  );
}
