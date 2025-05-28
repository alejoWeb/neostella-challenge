import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Define the logging format
const logFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
  let msg = `${ts} [${level}]: ${message} `;
  if (Object.keys(metadata).length > 0) {
    // Only include metadata if it's not empty and not just the 'level' or 'timestamp' symbol keys
    const cleanedMetadata = Object.entries(metadata)
      .filter(([key]) => typeof key !== 'symbol')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, any>);

    if (Object.keys(cleanedMetadata).length > 0) {
      msg += JSON.stringify(cleanedMetadata);
    }
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info', can be overridden by env variable
  format: combine(
    colorize(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    // You can add other transports here, like a file transport:
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
  exceptionHandlers: [ // Optional: Catch unhandled exceptions
    new winston.transports.Console({ format: colorize() }),
    // new winston.transports.File({ filename: 'exceptions.log' })
  ],
  rejectionHandlers: [ // Optional: Catch unhandled promise rejections
    new winston.transports.Console({ format: colorize() }),
    // new winston.transports.File({ filename: 'rejections.log' })
  ]
});

export default logger; 