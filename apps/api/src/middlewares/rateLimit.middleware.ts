import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas de login por IP
  message: {
    erro: 'Muitas tentativas de login a partir deste IP. Por favor, tente novamente após 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Limite de 100 requisições por minuto por IP
  message: {
    erro: 'Limite de requisições excedido. Por favor, aguarde alguns segundos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
