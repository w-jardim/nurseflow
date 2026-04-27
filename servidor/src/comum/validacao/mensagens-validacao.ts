import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

const ROTULOS_CAMPOS: Record<string, string> = {
  bio: 'Apresentação',
  cep: 'CEP',
  cidade: 'Cidade',
  complemento: 'Complemento',
  conselho: 'Conselho profissional',
  consultoriaId: 'Consultoria',
  cpf: 'CPF',
  cursoId: 'Curso',
  descricao: 'Descrição',
  email: 'E-mail',
  fimEm: 'Fim',
  inicioEm: 'Início',
  linkOnline: 'Link online',
  local: 'Local',
  logradouro: 'Logradouro',
  mensagem: 'Mensagem',
  modalidade: 'Modalidade',
  nome: 'Nome',
  nomePublico: 'Nome público',
  numero: 'Número',
  observacoes: 'Observações',
  origem: 'Origem',
  pacienteId: 'Paciente',
  precoCentavos: 'Preço',
  senha: 'Senha',
  slug: 'Endereço da página',
  sobrenome: 'Sobrenome',
  status: 'Status',
  telefone: 'Telefone',
  titulo: 'Título',
  uf: 'UF',
};

function rotuloCampo(campo: string) {
  return ROTULOS_CAMPOS[campo] ?? campo;
}

function extrairNumero(mensagem: string | undefined) {
  return mensagem?.match(/\d+/)?.[0];
}

function traduzirRestricao(campo: string, tipo: string, mensagemOriginal?: string) {
  const rotulo = rotuloCampo(campo);
  const numero = extrairNumero(mensagemOriginal);

  const mensagens: Record<string, string> = {
    isEmail: `${rotulo} deve ser um e-mail válido.`,
    isEnum: `${rotulo} possui uma opção inválida.`,
    isDateString: `${rotulo} deve ser uma data e hora válida.`,
    isInt: `${rotulo} deve ser um número inteiro.`,
    isString: `${rotulo} deve ser um texto válido.`,
    isUUID: `${rotulo} deve ter um identificador válido.`,
    matches: `${rotulo} possui formato inválido.`,
    whitelistValidation: `${rotulo} não é um campo permitido.`,
  };

  if (tipo === 'minLength') {
    return numero
      ? `${rotulo} deve ter pelo menos ${numero} caracteres.`
      : `${rotulo} está muito curto.`;
  }

  if (tipo === 'maxLength') {
    return numero
      ? `${rotulo} deve ter no máximo ${numero} caracteres.`
      : `${rotulo} está muito longo.`;
  }

  if (tipo === 'min') {
    return numero ? `${rotulo} deve ser no mínimo ${numero}.` : `${rotulo} está abaixo do permitido.`;
  }

  if (tipo === 'max') {
    return numero ? `${rotulo} deve ser no máximo ${numero}.` : `${rotulo} está acima do permitido.`;
  }

  return mensagens[tipo] ?? `${rotulo} possui valor inválido.`;
}

function coletarMensagens(erros: ValidationError[]): string[] {
  return erros.flatMap((erro) => {
    const mensagensDoCampo = Object.entries(erro.constraints ?? {}).map(([tipo, mensagem]) =>
      traduzirRestricao(erro.property, tipo, mensagem),
    );

    return [...mensagensDoCampo, ...coletarMensagens(erro.children ?? [])];
  });
}

export function criarErroValidacao(erros: ValidationError[]) {
  const mensagens = coletarMensagens(erros);

  return new BadRequestException({
    statusCode: 400,
    message: mensagens.length > 0 ? mensagens : ['Dados inválidos.'],
    error: 'Requisição inválida',
  });
}
