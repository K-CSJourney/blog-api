import config from '@/config';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import Token from '@/modules/token';
import type { IUser } from '@/modules/user';
import User from '@/modules/user';
import type { Request, Response } from 'express';

type UserData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as UserData;
    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(400).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    // 生成 access token 和 refresh token 给新用户
    const successToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 保存 refreshToken 到数据库
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      successToken,
    });
    logger.info('User login successfully', user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: error,
    });
    logger.error('Error during user registration', error);
  }
};

export default login;
