import * as jwt from 'jsonwebtoken';

export interface Payload {
  id: number;
  email: string;
  role: number;
}

export const generateToken = (payload: Payload): string => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined');
  }

  // Définit une valeur par défaut si JWT_DURING est vide
  const expiresIn = process.env.JWT_DURING || '1h';

  // Force le typage pour TypeScript
  return jwt.sign(payload as jwt.JwtPayload, secretKey as jwt.Secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): Payload => {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) throw new Error('JWT_SECRET is not defined');

  try {
    return jwt.verify(token, secretKey as jwt.Secret) as Payload;
  } catch {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): Payload | null => {
  return jwt.decode(token) as Payload | null;
};
