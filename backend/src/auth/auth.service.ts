import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya esta registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email);

    const permissions =
      user.role === 'SUPERADMIN'
        ? this.ALL_PERMISSIONS
        : (user.permissions as Record<string, string[]>) || {};

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
      access_token: token,
    };
  }

  private readonly ALL_PERMISSIONS = {
    eventos: ['ver', 'crear', 'editar', 'eliminar'],
    entrevistas: ['ver', 'crear', 'editar', 'eliminar'],
    francos: ['ver', 'crear', 'editar', 'eliminar'],
    clientes: ['ver', 'crear', 'editar', 'eliminar'],
    ingresos: ['ver'],
    demostraciones: ['ver'],
    usuarios: ['ver', 'crear', 'editar', 'eliminar'],
  };

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const token = this.generateToken(user.id, user.email);

    const permissions =
      user.role === 'SUPERADMIN'
        ? this.ALL_PERMISSIONS
        : (user.permissions as Record<string, string[]>) || {};

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
      access_token: token,
    };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    return this.jwtService.sign(payload, {
      expiresIn,
    } as any);
  }
}
