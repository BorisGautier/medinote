import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
};
