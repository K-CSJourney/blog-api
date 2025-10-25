import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import type { Request, Response } from 'express';

const getCommentByBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();
    if (!blog) {
      res.status(404).json({
        code: 'NoteFound',
        message: 'Blog not found',
      });
      return;
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(201).json({
      comments: allComments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error retrieving comments.', error);
  }
};

export default getCommentByBlog;
