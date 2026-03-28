import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `[${timestamp}] ${level}: ${message}`;
  if (stack) log += `\n${stack}`;
  if (Object.keys(meta).length > 0) log += `\n${JSON.stringify(meta, null, 2)}`;
  return log;
});

const logsDir = path.join(process.cwd(), 'logs');

const transports: winston.transport[] = [
  // Toujours en console
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  }),
];

// Fichiers rotatifs uniquement en production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports,
  exitOnError: false,
});

export default logger;
