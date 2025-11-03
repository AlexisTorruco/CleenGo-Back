import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { ProviderModule } from './provider/provider.module';
import { AdminModule } from './admin/admin.module';
import { SuscriptionModule } from './suscription/suscription.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '6543', 10), //para supabase puerto 6543
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      // Descubre entidades automáticamente
      autoLoadEntities: true,
      // entities: ['src/**/*.entity{.ts,.js}'],

      // migrations: ['src/migrations/**/*{.ts,.js}'],

      // Dev: sincroniza; Prod: usa migraciones
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      logging: process.env.NODE_ENV === 'development' ? false : false,
      dropSchema: process.env.NODE_ENV === 'development' ? false : false,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),

    AuthModule,

    ClientModule,

    ProviderModule,

    AdminModule,

    SuscriptionModule,

    AppointmentsModule,

    CategoriesModule,
  ],
})
export class AppModule {}
