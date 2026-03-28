import User from '../../models/User.model';
import { AppError } from '../../middlewares/errorHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils';
import { RegisterInput, LoginInput } from './auth.schema';
import logger from '../../config/logger';

export const registerService = async (data: RegisterInput & { phone?: string; dateOfBirth?: string }) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError('Cet email est déjà utilisé.', 409);

  const user = await User.create({
    email: data.email,
    password: data.password,
    role: 'patient',
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logger.info(`New patient registered: ${user.email} (${user.id})`);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    accessToken,
    refreshToken,
  };
};

export const loginService = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email }).select('+password +refreshToken');
  if (!user) throw new AppError('Email ou mot de passe incorrect.', 401);
  if (!user.isActive) throw new AppError('Compte désactivé. Contactez le support.', 403);

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    logger.warn(`Failed login attempt for email: ${data.email}`);
    throw new AppError('Email ou mot de passe incorrect.', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.email}`);

  return { user, accessToken, refreshToken };
};

export const refreshTokenService = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token invalide.', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutService = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  logger.info(`User logged out: ${userId}`);
};
