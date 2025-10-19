import { verifyRefreshToken, generateAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import Token from '@/modules/token';
import type { Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response) => {
  const resfreshToken = req.cookies.refreshToken as string;
  try {
    const tokenExits = await Token.exists({ token: resfreshToken });
    if (!tokenExits) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }

    // 验证 refresh token
    const jwtPlayload = verifyRefreshToken(resfreshToken) as { userId: Types.ObjectId };
    const accessToken = generateAccessToken(jwtPlayload.userId);
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Refresh token has expired, please login again',
      });
      return;
    }
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid refresh token',
      });
      return;
    }
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: error,
    });
    logger.error('Error during refreshing token', error);
  }
};

export default refreshToken;
