import Redis from 'ioredis-mock';

// Intercepte toutes les tentatives d'instanciation de Redis
// pour s'assurer que même les librairies tierces (comme BullMQ)
// utilisent la version mockée sans tenter de se connecter à l'hôte "redis".
jest.mock('ioredis', () => {
  const ioredisMock = require('ioredis-mock');
  return ioredisMock;
});

// Mock spécifique pour BullMQ qui peut créer ses propres connexions
jest.mock('bullmq', () => {
  const actual = jest.requireActual('bullmq');
  return {
    ...actual,
    Queue: jest.fn().mockImplementation((name, options) => {
      return new actual.Queue(name, {
        ...options,
        connection: new Redis(),
      });
    }),
    Worker: jest.fn().mockImplementation((name, processor, options) => {
      return new actual.Worker(name, processor, {
        ...options,
        connection: new Redis(),
      });
    }),
  };
});
