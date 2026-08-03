import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

const prisma = new PrismaClient();

export class AuthService {
  static async login(email: string, senhaPlana: string) {
    // 1. Busca usuário por email ativo
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.ativo) {
      throw new Error('Credenciais inválidas ou conta desativada.');
    }

    if (!user.tenant || !user.tenant.ativo) {
      throw new Error('Empresa (Tenant) desativada. Entre em contato com o suporte.');
    }

    // 2. Valida hash da senha
    const senhaValida = await bcrypt.compare(senhaPlana, user.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    // 3. Gera Access Token JWT (Curta Duração)
    const accessTokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(accessTokenPayload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN as any,
    });

    // 4. Gera Refresh Token JWT (Longa Duração)
    const refreshToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      ENV.REFRESH_TOKEN_SECRET,
      { expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as any }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          nome: user.tenant.nome,
          cnpj: user.tenant.cnpj,
        },
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return user;
  }
}
