// CleenGo-Back/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { User } from 'src/user/entities/user.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { DashboardCacheModule } from 'src/Dashboard/dashboard-cache.module';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Provider, Suscription]),
    DashboardCacheModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
