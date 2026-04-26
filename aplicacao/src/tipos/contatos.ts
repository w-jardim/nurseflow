export type Contato = {
  id: string;
  nome: string;
  sobrenome: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  endereco?: string | null;
  criadoEm: string;
};
