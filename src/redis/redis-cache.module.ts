import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
          throw new Error(
            '❌ No se encontró la variable REDIS_URL. Asegúrate de definirla en Render o tu .env'
          );
        }

        console.log('🚀 Conectando a Redis:', redisUrl);

        return new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
