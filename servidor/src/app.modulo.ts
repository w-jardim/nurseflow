import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppControlador } from './app.controlador';
import { PrismaModulo } from './comum/prisma/prisma.modulo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModulo,
  ],
  controllers: [AppControlador],
})
export class AppModulo {}
