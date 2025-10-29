import commentBlog from '@/controllers/v1/comment/comment_blog';
import deleteComment from '@/controllers/v1/comment/delete_comment';
import getAllComments from '@/controllers/v1/comment/get_all_comment';
import getCommentByBlog from '@/controllers/v1/comment/get_comment_by_blog';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import { Router } from 'express';
import { body, param, query } from 'express-validator';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['admin']),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 to 50.'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a possitive interger.'),
  validationError,
  getAllComments,
);

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
