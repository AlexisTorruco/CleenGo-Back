import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterProviderDto } from 'src/provider/dto/create-provider.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //? -------- Registro de cliente --------
  @ApiBody({
    type: RegisterUserDto,
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al registrar cliente' })
  @Post('register/client')
  clientSignUp(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.clientSignUp(registerUserDto);
  }

  //? -------- Registro de proveedor --------
  @ApiBody({
    type: RegisterProviderDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Proveedor registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Error al registrar proveedor' })
  @Post('register/provider')
  providerSignUp(@Body() registerProviderDto: RegisterProviderDto) {
    return this.authService.providerSignUp(registerProviderDto);
  }

  //? -------- Inicio de sesión --------
  @ApiOperation({
    summary: 'Inicio de sesión',
    description: 'Inicio de sesión de usuarios con email y contraseña',
  })
  @ApiBody({
    type: LoginAuthDto,
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Usuario autenticado exitosamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @Post('login')
  logIn(@Body() loginUser: LoginAuthDto) {
    return this.authService.logIn(loginUser);
  }

  //? -------- OAuth --------
  @Get('third-party/:role')
  thirdPartyAuth(
    @Param('role') role: string,
    @Query('connection') connection: string | undefined,
    @Req() req: any,
    @Res() res: any,
  ) {}

  // // --- PRUEBA ---
  // @ApiBearerAuth() //Valida en swagger
  // @UseGuards(JwtAuthGuard, RolesGuard) //Valida el token
  // @Roles(Role.CLIENT, Role.PROVIDER) //Valida el rol
  // @Get('me')
  // getProfile(@Req() req: any) {
  //   return {
  //     message: '✅ Ruta protegida',
  //     user: req.user, // viene de jwt.strategy.validate
  //   };
  // }
}
