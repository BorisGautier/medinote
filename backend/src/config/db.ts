import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI as string;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in environment');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
