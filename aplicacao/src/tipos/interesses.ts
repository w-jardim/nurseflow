export type OrigemInteresse = 'PERFIL' | 'CURSO' | 'CONSULTORIA';

export type InteressePublico = {
  id: string;
  origem: OrigemInteresse;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  visualizadoEm: string | null;
  criadoEm: string;
  curso: {
    id: string;
    titulo: string;
  } | null;
  consultoria: {
    id: string;
    titulo: string;
  } | null;
};
