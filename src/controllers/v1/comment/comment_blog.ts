import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import type { Request, Response } from 'express';
import type { IComment } from '@/models/comment';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

type CommentData = Pick<IComment, 'content'>;
const window = new JSDOM('').window;
const purify = DOMPurify(window);

const commentBlog = async (req: Request, res: Response) => {
  const { content } = req.body as CommentData;
  const { blogId } = req.params;
  const userId = req.userId;
  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();
    if (!blog) {
      res.status(404).json({
        code: 'NoteFound',
        message: 'Blog not found',
      });
      return;
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await Comment.create({
      blogId,
      userId: userId,
      content: cleanContent,
    });
    logger.info('New comment created', newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info('Blog comment successfully.', {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.status(201).json({
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error: error,
    });
    logger.error('Error during commenting blog creation.', error);
  }
};

export default commentBlog;
