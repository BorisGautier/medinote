import Redis from 'ioredis';
import logger from './logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis retry attempt ${times}, retrying in ${delay}ms`);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.error('Redis error, reconnecting:', err.message);
        return true;
      },
      lazyConnect: false,
      enableReadyCheck: true,
    });

    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('ready', () => logger.info('✅ Redis ready'));
    redisClient.on('error', (err) => logger.error('❌ Redis error:', err));
    redisClient.on('close', () => logger.warn('⚠️  Redis connection closed'));
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Verrouillage de créneaux (anti double-réservation)
export const lockSlot = async (
  doctorId: string,
  slotTime: string,
  userId: string,
  ttlSeconds = 600 // 10 minutes
): Promise<boolean> => {
  const redis = getRedisClient();
  const key = `slot:lock:${doctorId}:${slotTime}`;
  const result = await redis.set(key, userId, 'EX', ttlSeconds, 'NX');
  return result === 'OK';
};

export const unlockSlot = async (doctorId: string, slotTime: string): Promise<void> => {
  const redis = getRedisClient();
  const key = `slot:lock:${doctorId}:${slotTime}`;
  await redis.del(key);
};

export const isSlotLocked = async (doctorId: string, slotTime: string): Promise<boolean> => {
  const redis = getRedisClient();
  const key = `slot:lock:${doctorId}:${slotTime}`;
  const val = await redis.get(key);
  return val !== null;
};

export default getRedisClient;
