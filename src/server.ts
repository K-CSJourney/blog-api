import express from 'express';
import config from '@/config';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import limiter from '@/lib/express_limit_rate';
import v1Routes from '@/routes/v1';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger, logtail } from '@/lib/winston';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: ${origin} is not allowed by CORS`), false);
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
    }
  },
  credentials: true,
};
// 添加 CORS 中间件
app.use(cors(corsOptions));
// 启用 JSON 请求体解析
app.use(express.json());
// 启用 URL-encoded 请求体解析
// 设置 `extended: true` 来允许复杂对象和列表
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// 启用响应压缩，来节省负载大小、提升性能
app.use(
  compression({
    threshold: 1024, // 仅压缩大于 1KB 的响应
  }),
);

// 使用 Helmet 来增强 API 的安全性
app.use(helmet());

// 使用限流中间件来防止高频请求和提高安全性
app.use(limiter);

/**
 * 立即执行的异步函数来启动服务
 * - 尝试在初始化服务之前连接数据库
 * - 定义 API Router (`/api/v1`)
 * - 启动 Express 服务器并监听指定端口
 * - 如果在生产环境中启动失败，则退出进程
 */
(async () => {
  try {
    await connectToDatabase();
    app.use('/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start the server: ', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * 优雅处理服务停止过程时，断开与数据库的连接
 * - 在服务停止之前断开与数据库的连接
 * - 如果断开连接成功，打印成功日志
 * - 如果在断开过程中出现错误，打印错误日志
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Server SHUTDOWN');
    // 确保所有日志在退出前被发送
    await logtail.flush();
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown:', error);
  }
};

/**
 * 监听终止信号以调用 `handleServerShutdown`
 */
process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);
