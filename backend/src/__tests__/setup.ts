import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// 🛡️ Pre-emptive Mocks (Hauts de fichiers)
jest.mock('ioredis', () => require('ioredis-mock'));
jest.mock('../config/redis', () => {
  const Redis = require('ioredis-mock');
  const client = new Redis();
  return {
    getRedisClient: jest.fn().mockReturnValue(client),
    default: jest.fn().mockReturnValue(client),
    closeRedis: jest.fn().mockResolvedValue(true),
    lockSlot: jest.fn().mockResolvedValue(true),
    unlockSlot: jest.fn().mockResolvedValue(true),
    isSlotLocked: jest.fn().mockResolvedValue(false),
  };
});

jest.mock('../queues/email.queue', () => ({
  addEmailToQueue: jest.fn().mockResolvedValue(true),
  emailQueue: { add: jest.fn().mockResolvedValue(true) },
  emailWorker: { on: jest.fn() },
}));

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // 🧹 Setup Environnement (Indispensable pour limiter les variables)
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-long-enough-32-chars-plus';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-long-enough-32-chars';
  process.env.REDIS_HOST = 'localhost';

  // 💾 MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Forcer la déconnexion si déjà connecté (rare mais possible en worker)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri, {
    connectTimeoutMS: 20000,
    socketTimeoutMS: 20000,
  });
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});
