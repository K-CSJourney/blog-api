import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import User from '@/models/user';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);
    await cloudinary.api.delete_resources(publicIds);
    logger.info('Multiple blog banners deleted from Cloudinary', { publicIds });

    await Blog.deleteMany({ author: userId });
    logger.info('Multiple blogs deleted:', blogs);
    await User.deleteOne({ _id: userId });
    logger.info('A user account is being deleted:', userId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error while deleting user by id.', error);
  }
};

export default deleteUser;
