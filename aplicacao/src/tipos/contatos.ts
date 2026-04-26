export type Contato = {
  id: string;
  nome: string;
  sobrenome: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  criadoEm: string;
};
