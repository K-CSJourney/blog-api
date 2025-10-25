import config from '@/config';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import Token from '@/models/token';
import User, { IUser } from '@/models/user';
import { genUsername } from '@/utils';
import type { Request, Response } from 'express';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;
const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body as UserData;

  if(role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
    res.status(403).json({
      code: 'AuthorizationError',
      message: 'You can not register as an admin',
    });

    logger.warn(`User with email ${email} tried to register as an admin but is not in the whitelisted`);
    return;
  }

  try {
    const username = genUsername();
    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    // 生成 access token 和 refresh token 给新用户
    const sccessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // 保存 refreshToken 到数据库
    await Token.create({ token: refreshToken, userId: newUser._id });
    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      sccessToken,
    });
    logger.info('User registered successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error: error,
    });
    logger.error('Error during user registration', error);
  }
};

export default register;
