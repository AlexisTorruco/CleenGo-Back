import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { filterAppointmentDto } from './dto/filter-appointment.dto';

import { AppointmentStatus } from 'src/enum/appointmenStatus.enum';
import { Role } from 'src/enum/role.enum';

import { User } from 'src/user/entities/user.entity';
import { Service } from 'src/categories/entities/services.entity';
import { Provider } from 'src/provider/entities/provider.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  // ✅ ESTE ES TU MÉTODO PARA EL CHAT (no afecta lo de tu compa)
  async getParticipantsOrFail(appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: { clientId: true, providerId: true },
      select: {
        id: true,
        status: true,
        isActive: true,
        clientId: { id: true },
        providerId: { id: true },
      },
    });

    if (!appointment) {
      throw new NotFoundException('La cita no existe');
    }

    if (!appointment.isActive) {
      throw new ForbiddenException('La cita no está activa');
    }

    if (appointment.status !== AppointmentStatus.CONFIRMEDPROVIDER) {
      throw new ForbiddenException(
        'El chat solo está disponible cuando la cita ha sido confirmada por el proveedor',
      );
    }

    return {
      clientId: appointment.clientId?.id,
      providerId: appointment.providerId?.id,
    };
  }

  // ================== LÓGICA DE TU COMPA (SIN TOCAR) ==================

  async create(createAppointmentDto: CreateAppointmentDto, authUser: any) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });

    if (!user) throw new NotFoundException('user not found');

    const { service, date, startTime, notes, providerEmail, address } =
      createAppointmentDto;

    if (!date || !startTime || !notes || !providerEmail || !address) {
      throw new BadRequestException('all required fields must be complete');
    }

    // verifico que la fecha de emision sea posterior a la actual
    const appointmentDateType = new Date(date);
    appointmentDateType.setMinutes(
      appointmentDateType.getMinutes() +
        appointmentDateType.getTimezoneOffset(),
    );

    const today = new Date();

    if (appointmentDateType <= today) {
      throw new BadRequestException(
        'the appointment date must be later than the current date',
      );
    }

    // busco el proveedor
    const providerFound = await this.providerRepository.findOne({
      where: { email: providerEmail, role: Role.PROVIDER },
    });

    if (!providerFound) throw new NotFoundException('Provider not found');

    this.validateProviderWorksThatDay(providerFound, date);
    this.validateStartHourInWorkingRange(providerFound, startTime);
    await this.validateNoStartOverlap(providerFound.id, date, startTime);

    // CREACION DEL APPOINTMENT
    const appointment = new Appointment();

    appointment.clientId = user;
    appointment.providerId = providerFound;
    // appointment.services = foundService;
    appointment.date = date as any;
    appointment.startHour = startTime;
    appointment.notes = notes;
    appointment.addressUrl = address;

    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  async findAllUserAppointments(authUser: any, filters: filterAppointmentDto) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.clientId', 'client')
      .leftJoinAndSelect('appointment.providerId', 'provider');
    // .leftJoinAndSelect('appointment.serviceId', 'service')
    // .leftJoinAndSelect('appointment.serviceId.categoryId', 'category');

    if (user.role === Role.CLIENT) {
      query.where('client.id = :user', { user: user.id });
    } else if (user.role === Role.PROVIDER) {
      query.where('provider.id = :user', { user: user.id });
    }

    if (filters.status) {
      query.andWhere('appointment.status = :status', {
        status: filters.status,
      });
    }

    if (filters.category) {
      query.andWhere('service.categoryId.name = :category', {
        category: filters.category,
      });
    }

    if (filters.provider) {
      query.andWhere('provider_id.name = :provider', {
        provider: filters.provider,
      });
    }

    if (filters.client) {
      query.andWhere('client_id.name = :client', {
        client: filters.client,
      });
    }

    if (filters.date) {
      query.andWhere('appointment.date = :date', {
        date: filters.date,
      });
    }

    query.orderBy('appointment.date', 'DESC');

    const appointments: Appointment[] = await query.getMany();

    if (user.role === Role.PROVIDER) {
      const providerAppointments = appointments.filter(
        (appointment) => appointment.providerId.id === user.id,
      );
      const clientAppointments = appointments.filter(
        (appointment) => appointment.clientId.id === user.id,
      );

      return { providerAppointments, clientAppointments };
    } else {
      const providerAppointments: Appointment[] = [];
      const clientAppointments = appointments.filter(
        (appointment) => appointment.clientId.id === user.id,
      );

      return { providerAppointments, clientAppointments };
    }
  }

  async findOne(id: string, authUser: any) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId', 'services'],
    });

    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (
      appointment.clientId.id !== user.id &&
      appointment.providerId.id !== user.id
    ) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    authUser: any,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['providerId'],
    });

    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (appointment.providerId.id !== user.id) {
      throw new BadRequestException(
        '⚠️ Only the provider can update this appointment',
      );
    }

    if (updateAppointmentDto.endHour)
      appointment.endHour = updateAppointmentDto.endHour;
    if (updateAppointmentDto.price)
      appointment.price = updateAppointmentDto.price;

    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(id: string, status: AppointmentStatus, authUser: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId'],
    });

    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');

    if (
      appointment.clientId.id !== user.id &&
      appointment.providerId.id !== user.id
    ) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    if (appointment.status === status)
      throw new BadRequestException('⚠️ The status is the same');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('⚠️ The status is already cancelled');
    }

    if (
      status === AppointmentStatus.PENDING &&
      user !== appointment.providerId
    ) {
      throw new BadRequestException(
        '⚠️ only the provider can change the status to pending',
      );
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, authuser: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['clientId', 'providerId'],
    });

    const user = await this.userRepository.findOne({
      where: { id: authuser.id },
    });
    if (!user) throw new BadRequestException('⚠️ User not found');
    if (!appointment) throw new BadRequestException('⚠️ Appointment not found');

    if (user.role === 'client' && appointment.clientId.id !== user.id) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }
    if (user.role === 'provider' && appointment.providerId.id !== user.id) {
      throw new BadRequestException(
        '⚠️ You are not the owner of this appointment',
      );
    }

    return this.appointmentRepository.update(id, { isActive: false });
  }

  // ---------------------- HELPERS ----------------------

  private validateProviderWorksThatDay(
    provider: Provider,
    date: string | Date,
  ) {
    const paseDate = new Date(date);
    paseDate.setHours(12, 0, 0, 0);

    let day = paseDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toUpperCase();

    day = day.charAt(0).concat(day.slice(1).toLowerCase());

    if (!provider.days?.includes(day)) {
      throw new BadRequestException(`Provider does not work on ${day}`);
    }
  }

  private validateStartHourInWorkingRange(
    provider: Provider,
    startHour: string,
  ) {
    const start = this.timeToMinutes(startHour);

    const isInside = provider.hours?.some((range) => {
      const [from, to] = range.split('-');
      const fromMin = this.timeToMinutes(from);
      const toMin = this.timeToMinutes(to);
      return start >= fromMin && start <= toMin;
    });

    if (!isInside) {
      throw new BadRequestException(`Provider is not working at ${startHour}`);
    }
  }

  private async validateNoStartOverlap(
    providerId: string,
    date: Date | string,
    startHour: string,
  ) {
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        providerId: { id: providerId } as any,
        date: new Date(date) as any,
        isActive: true,
      },
    });

    const newStart = this.timeToMinutes(startHour);

    const hasOverlap = existingAppointments.some((a) => {
      const appointmentStart = this.timeToMinutes(a.startHour);
      const appointmentEnd = this.timeToMinutes(a.endHour);
      return newStart >= appointmentStart && newStart < appointmentEnd;
    });

    if (hasOverlap) {
      throw new BadRequestException(
        `Provider already has an appointment at ${startHour}`,
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
