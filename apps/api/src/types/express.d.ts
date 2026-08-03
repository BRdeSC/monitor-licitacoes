import { UserRole } from '@prisma/client';

export interface UserPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      tenantId?: string;
    }
  }
}
