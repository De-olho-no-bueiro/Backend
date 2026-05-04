import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  constructor(config: ConfigService) {
    const connectionString =
      config.get<string>('APP_DATABASE_URL') ??
      process.env.APP_DATABASE_URL ??
      process.env.DATABASE_URL ??
      '';

    if (!connectionString) {
      throw new Error('DATABASE_URL/APP_DATABASE_URL ausente. Defina conexão PostgreSQL antes de iniciar API.');
    }

    const adapter = new PrismaPg({
      connectionString,
      // Evita falhas intermitentes: conexões idle fecham em 10s por padrão no Prisma v7
      idleTimeoutMillis: 300_000, // 5 min
      connectionTimeoutMillis: 10_000, // 10s para estabelecer conexão
      max: 10,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Supabase (PostgreSQL) conectado com sucesso');
    } catch (error) {
      this.logger.error('Falha ao conectar ao Supabase', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
