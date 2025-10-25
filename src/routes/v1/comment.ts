import commentBlog from '@/controllers/v1/comment/comment_blog';
import getCommentByBlog from '@/controllers/v1/comment/get_comment_by_blog';
import deleteComment from '@/controllers/v1/comment/delete_comment';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import { Router } from 'express';
import { body, param } from 'express-validator';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['user', 'admin']),
  param('blogId').isMongoId().withMessage('Invalid blog ID'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validationError,
  commentBlog,
);

router.get(
  '/blog/:blogId',
  authenticate,
  authorize(['user', 'admin']),
  param('blogId').isMongoId().withMessage('Invalid blog ID'),
  validationError,
  getCommentByBlog,
);

router.delete(
  '/:commentId',
  authenticate,
  authorize(['user', 'admin']),
  param('commentId').isMongoId().withMessage('Invalid comment ID'),
  validationError,
  deleteComment,
);

export default router;
