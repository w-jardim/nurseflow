import { useEffect, useState } from 'react';
import { PainelContatos } from '../../componentes/PainelContatos';
import { requisitarApi } from '../../servicos/api';
import type { Contato } from '../../tipos/contatos';

export function PaginaPacientes() {
  const [pacientes, setPacientes] = useState<Contato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    requisitarApi<Contato[]>('/pacientes', { autenticada: true })
      .then(setPacientes)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function criarPaciente(dados: {
    nome: string; sobrenome: string; cpf: string; email: string;
    telefone: string; cep: string; logradouro: string; numero: string;
    complemento: string; bairro: string; cidade: string; uf: string;
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
    setPacientes((p) => [paciente, ...p]);
  }

  if (carregando) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <PainelContatos
      titulo="Paciente"
      descricao="Cadastre pacientes para atendimentos e agenda."
      contatos={pacientes}
      coletarEndereco
      aoCriar={criarPaciente}
    />
  );
}
