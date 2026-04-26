import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModulo } from './app.modulo';
import { criarErroValidacao } from './comum/validacao/mensagens-validacao';

async function bootstrap() {
  const app = await NestFactory.create(AppModulo);
  const configuracao = app.get(ConfigService);
  const porta = configuracao.get<number>('PORTA', 3000);

  app.enableCors({
    origin: configuracao.get<string>('ORIGEM_APLICACAO', 'http://localhost:5173'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: criarErroValidacao,
    }),
  );

  await app.listen(porta);
}

void bootstrap();
