import { logger } from '@/lib/winston';
import { Request, Response } from 'express';
import User from '@/modules/user';

const deleteCurrentUser = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    await User.deleteOne({ _id: userId });
    logger.info('A user account is being deleted:', userId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error while deleting current user account.', error);
  }
};

export default deleteCurrentUser;
