import { UnauthorizedException } from '@nestjs/common';
import { scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const scryptAsync = promisify(scrypt);

describe('AuthService', () => {
  const findUnique = jest.fn();
  const prisma = {
    user: { findUnique },
  } as unknown as PrismaService;
  const service = new AuthService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('returns public user data for valid credentials', async () => {
    const password = 'Senha123!';
    const salt = '0123456789abcdef0123456789abcdef';
    const key = (await scryptAsync(password, salt, 64)) as Buffer;

    findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Ana Silva',
      email: 'ana@example.com',
      role: 'TALENT',
      passwordHash: `${salt}:${key.toString('hex')}`,
    });

    await expect(
      service.login({ email: ' ANA@example.com ', password }),
    ).resolves.toEqual({
      message: 'Credenciais válidas.',
      user: {
        id: 'user-id',
        name: 'Ana Silva',
        email: 'ana@example.com',
        role: 'TALENT',
      },
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'ana@example.com' } }),
    );
  });

  it('rejects invalid credentials without exposing the password hash', async () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const key = (await scryptAsync('SenhaCorreta123!', salt, 64)) as Buffer;
    findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Ana Silva',
      email: 'ana@example.com',
      role: 'TALENT',
      passwordHash: `${salt}:${key.toString('hex')}`,
    });

    await expect(
      service.login({ email: 'ana@example.com', password: 'SenhaErrada123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
