//CleenGo-Back/src/Dashboard/dashboard-cron.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardCronService } from './dashboard-cron.service';
import { DashboardCacheModule } from './dashboard-cache.module';
import { AdminModule } from '../admin/admin.module';
import { AdminService } from 'src/admin/admin.service';
import { DashboardCacheService } from './dashboard-cache.service';
import { Type } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Provider, Suscription]),
    ScheduleModule.forRoot(),
    DashboardCacheModule,
    AdminModule,
  ],
  providers: [DashboardCronService, AdminService, DashboardCacheService],
})
export class DashboardCronModule {}
