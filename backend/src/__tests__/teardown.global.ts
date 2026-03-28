import { MongoMemoryServer } from 'mongodb-memory-server';

export async function teardown(): Promise<void> {
  const mongod: MongoMemoryServer = (global as any).__MONGOD__;
  if (mongod) await mongod.stop();
}

module.exports = teardown;
