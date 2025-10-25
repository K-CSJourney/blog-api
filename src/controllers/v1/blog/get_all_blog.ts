import config from '@/config';
import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import User from '@/models/user';
import { Request, Response } from 'express';

interface QueryType {
    status?: 'draft' | 'published';
}

const getAllBlog = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
    const user = await User.findById(userId).select('role').lean().exec();
    const query: QueryType = {};

    if(user?.role === 'user') {
        query.status = 'published';
    }

    const blogs = await Blog.find(query)
      .select('-banner_iamge -__v')
      .populate('author', '-createdAt -updatedAt -__v')
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const total = await Blog.countDocuments(query);

    res.status(200).json({
      limit,
      offset,
      total,
      blogs,
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

export default getAllBlog;
