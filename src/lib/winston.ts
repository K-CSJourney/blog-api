import winston from 'winston';
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

// Define transports array
const transports: winston.transport[] = [];

// 如果应用不是在生产环境运行，添加日志转化
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // 彩色输出
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }), // 自定义时间格式
        align(), // 对齐日志信息
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta)}` : '';

          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
}

// 创建一个 logger 实例来使用 winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info', // 设置默认日志级别
  format: combine(timestamp(), errors({ stack: true }), json()), // 使用 JSON 格式化日志
  transports,
  silent: config.NODE_ENV === 'test', // 在测试环境中禁用日志
});

export { logger };
