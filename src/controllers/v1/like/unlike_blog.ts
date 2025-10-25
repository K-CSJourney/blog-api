import { logger } from '@/lib/winston';
import type { IBlog } from '@/modules/blog';
import Blog from '@/modules/blog';
import Like from '@/modules/like';
import { Request, Response } from 'express';

const unlikeBlog = async (req: Request, res: Response) => {
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
        message: 'Liked not found',
      });
      return;
    }

    await Like.deleteOne({ _id: existLike._id });

    blog.likesCount--;
    await blog.save();

    logger.info('Blog unliked successfully.', {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error during unliking blog.', error);
  }
};

export default unlikeBlog;
