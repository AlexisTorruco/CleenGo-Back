import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth';
import { SUPABASE_CLIENT } from './supabase/supabase.module';
import { SupabaseClient } from '@supabase/supabase-js';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/enum/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterProviderDto } from 'src/provider/dto/create-provider.dto';
import { Provider } from 'src/provider/entities/provider.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient,

    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,

    private readonly jwtService: JwtService,
  ) {}

  //? -------- Registro de cliente --------
  async clientSignUp(registerUserDto: RegisterUserDto) {
    const { name, surname, email, password, birthDate, profileImgUrl, phone } =
      registerUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException(
        '⚠️ Ya existe un usuario registrado con ese email',
      );

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'client',
          name,
          surname,
          phone,
        },
      },
    });

    if (error) {
      // console.log('🔥 SUPABASE ERROR:', error);
      throw new BadRequestException(`⚠️ Supabase: ${error.message}`);
    }

    if (!data.user) {
      // console.log('🔥 SUPABASE DATA WITHOUT USER:', data);
      throw new BadRequestException('⚠️ Supabase no devolvió un usuario');
    }

    const supabaseUser = data.user;

    const formattedName = this.capitalize(name);
    const formattedSurname = this.capitalize(surname);

    const birthDateValue =
      birthDate instanceof Date ? birthDate : new Date(birthDate);

    console.log('Role.CLIENT =>', Role.CLIENT);

    const newUser = this.userRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseUser.id,
      birthDate: birthDateValue,
      profileImgUrl,
      phone,
      role: Role.CLIENT,
    });

    const savedUser = await this.userRepository.save(newUser);

    const { passwordUrl, ...safeUser } = savedUser;

    return {
      message: '✅ Usuario cliente registrado exitosamente',
      user: safeUser,
      // supabaseUser, // sólo para debug
    };
  }

  //? -------- Capitalize helper --------
  private capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  //? -------- Registro de proveedor --------
  async providerSignUp(registerProviderDto: RegisterProviderDto) {
    const {
      name,
      surname,
      email,
      password,
      birthDate,
      profileImgUrl,
      phone,
      days,
      hours,
      about,
    } = registerProviderDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new BadRequestException(
        '⚠️ Ya existe un usuario registrado con ese email',
      );

    const { data, error } = await this.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'provider',
          name,
          surname,
          phone,
        },
      },
    });

    if (error) {
      // console.log('🔥 SUPABASE ERROR:', error);
      throw new BadRequestException(`⚠️ Supabase: ${error.message}`);
    }

    if (!data.user) {
      // console.log('🔥 SUPABASE DATA WITHOUT USER:', data);
      throw new BadRequestException('⚠️ Supabase no devolvió un usuario');
    }

    const supabaseProvider = data.user;

    const formattedName = this.capitalize(name);
    const formattedSurname = this.capitalize(surname);

    const birthDateValue =
      birthDate instanceof Date ? birthDate : new Date(birthDate);

    const newProvider = this.providerRepository.create({
      name: formattedName,
      surname: formattedSurname,
      email,
      passwordUrl: supabaseProvider.id,
      birthDate: birthDateValue,
      profileImgUrl,
      phone,
      days,
      hours,
      about,
      role: Role.PROVIDER,
    });

    const savedProvider = await this.providerRepository.save(newProvider);

    const { passwordUrl, ...safeProvider } = savedProvider;

    return {
      message: '✅ Usuario proveedor registrado exitosamente',
      provider: safeProvider,
      // supabaseProvider, // sólo para debug
    };
  }

  //? -------- Inicio de sesión --------
  async logIn(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new BadRequestException(` ⚠️Credenciales inválidas`);

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user)
      throw new BadRequestException(
        '⚠️ Usuario autenticado en supabase no existe en la base de datos',
      );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const { passwordUrl, ...safeUser } = user;

    return {
      message: '✅ Inicio de sesión exitoso',
      accessToken,
      user: safeUser,
    };
  }

  //? -------- OAuth --------
  async thirdPartyAuth(
    role: string,
    connection: string | undefined,
    req: any,
    res: any,
  ) {}
}
