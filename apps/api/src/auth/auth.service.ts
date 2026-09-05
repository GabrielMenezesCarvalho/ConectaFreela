import { Injectable, UnauthorizedException } from '@nestjs/common';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (
      !user ||
      !(await this.verifyPassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return {
      message: 'Credenciais válidas.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private async verifyPassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash || !/^[a-f0-9]+$/i.test(hash)) {
      return false;
    }

    const storedKey = Buffer.from(hash, 'hex');
    const derivedKey = (await scryptAsync(
      password,
      salt,
      storedKey.length,
    )) as Buffer;

    return (
      storedKey.length === derivedKey.length &&
      timingSafeEqual(storedKey, derivedKey)
    );
  }
}
