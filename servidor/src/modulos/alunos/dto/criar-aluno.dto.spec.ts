import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CriarAlunoDto } from './criar-aluno.dto';

describe('CriarAlunoDto', () => {
  const dadosValidos = {
    nome: 'João',
    sobrenome: 'Silva',
    email: 'joao@example.com',
    cpf: '390.533.447-05',
    telefone: '(11) 99999-9999',
  };

  it('aceita dados válidos e normaliza CPF/telefone', async () => {
    const dto = plainToInstance(CriarAlunoDto, dadosValidos);

    const erros = await validate(dto);

    expect(erros).toHaveLength(0);
    expect(dto.cpf).toBe('39053344705');
    expect(dto.telefone).toBe('11999999999');
  });

  it('rejeita campos obrigatórios ausentes', async () => {
    const dto = plainToInstance(CriarAlunoDto, {
      nome: 'João',
      email: 'joao@example.com',
    });

    const propriedadesComErro = (await validate(dto)).map((erro) => erro.property);

    expect(propriedadesComErro).toEqual(expect.arrayContaining(['sobrenome', 'cpf']));
  });

  it('rejeita email inválido', async () => {
    const dto = plainToInstance(CriarAlunoDto, {
      ...dadosValidos,
      email: 'email-invalido',
    });

    const erros = await validate(dto);

    expect(erros.some((erro) => erro.property === 'email')).toBe(true);
  });

  it('rejeita CPF com tamanho inválido após limpeza', async () => {
    const dto = plainToInstance(CriarAlunoDto, {
      ...dadosValidos,
      cpf: '123',
    });

    const erros = await validate(dto);

    expect(erros.some((erro) => erro.property === 'cpf')).toBe(true);
  });
});
