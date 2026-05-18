import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/app.log',
      maxsize: 10485760,
      maxFiles: 3,
      format: combine(
        winston.format((info) => {
          return info.level === 'error' ? false : info;
        })(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 3
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    )
  }));
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;
