import type { Request, Response, NextFunction } from 'express';
import Token from '@/modules/token';
import { logger } from '@/lib/winston';
import { verifyAccessToken } from '@/lib/jwt';
import type { Types } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access token is missing or invalid',
    });
    return;
  }

  const [_, token] = authHeader.split(' ');
  try {
    const jwtPlayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    req.userId = jwtPlayload.userId;
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token has expired, request a new one with refresh token',
      });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token invalid',
      });
      return;
    }
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: error,
    });
    logger.error('Error during authenticating', error);
  }
};

export default authenticate;
