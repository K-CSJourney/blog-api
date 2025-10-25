import { logger } from '@/lib/winston';
import type { IBlog } from '@/models/blog';
import Blog from '@/models/blog';
import Like from '@/models/like';
import { Request, Response } from 'express';

const likeBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const { userId } = req.body;
  try {
    const blog = await Blog.findById(blogId).select('likesCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const existLike = await Like.findOne({ blogId, userId }).lean().exec();
    if (!existLike) {
      res.status(400).json({
        code: 'BadRequest',
        message: 'You already liked this blog',
      });
      return;
    }

    await Like.create({ blogId, userId });

    blog.likesCount++;
    await blog.save();

    logger.info('Blog liked successfully.', {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.status(200).json({
      likesCount: blog.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error during liking blog.', error);
  }
};

export default likeBlog;
