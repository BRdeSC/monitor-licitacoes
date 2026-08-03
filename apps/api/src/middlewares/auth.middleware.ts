import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserPayload } from '../types/express';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Tenta extrair token do Header Authorization ou do Cookie HTTPOnly
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ erro: 'Não autorizado. Token de acesso ausente.' });
    }

    // 2. Valida o Token JWT
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as UserPayload;
    
    if (!decoded || !decoded.userId || !decoded.tenantId) {
      return res.status(401).json({ erro: 'Token inválido ou com payload corrompido.' });
    }

    req.user = decoded;
    req.tenantId = decoded.tenantId;

    return next();
  } catch (error: any) {
    return res.status(401).json({ erro: 'Sessão expirada ou token inválido.', detalhes: error.message });
  }
}
