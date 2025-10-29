import config from '@/config';
import { logger } from '@/lib/winston';
import Comment from '@/models/comment';
import { Request, Response } from 'express';

const getAllComments = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    let offset = parseInt(req.query.offset as string) || config.defaultResOffset;

    const total = await Comment.countDocuments();

    if (offset >= total) {
      offset = 0;
    }

    const comments = await Comment.find()
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      limit,
      offset,
      total,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error while fectching blogs.', error);
  }
};

export default getAllComments;
