import { Injectable } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class AppointmentsCronService {
    constructor(
        private readonly appointmentsService: AppointmentsService
    ){}

    // @Cron(CronExpression.EVERY_5_MINUTES)
//     async handleAppointmentsUpdate() {
//         console.log('Cron: enviando emails de citas pendientes...');
//         await this.appointmentsService.validatePendingAppointments();
//     }
}