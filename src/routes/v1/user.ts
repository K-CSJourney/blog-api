import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';
import deleteUser from '@/controllers/v1/user/delete_user';
import getAllUser from '@/controllers/v1/user/get_all_user';
import getCurrentUser from '@/controllers/v1/user/get_current_user';
import getUser from '@/controllers/v1/user/get_user';
import updateCurrentUser from '@/controllers/v1/user/update_current_user';
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';
import User from '@/modules/user';
import { Router } from 'express';
import { body, param, query } from 'express-validator';

const router = Router();

router.get('/current', authenticate, authorize(['admin', 'user']), getCurrentUser);

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  body('username')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Username must be at last 20 characters.')
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw Error('This username already in use.');
      }
    }),
  body('email')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Email must be at last 50 characters.')
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw Error('This email already in use.');
      }
    }),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('first_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Fisrt name must be at least 20 characters long.'),
  body('last_name')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Fisrt name must be at least 20 characters long.'),
  body(['website', 'facebook', 'instagram', 'linkedin', 'x', 'youtube'])
    .optional()
    .isURL()
    .withMessage('Invalid URL')
    .isLength({ max: 100 })
    .withMessage('Url must be less than 100 characters long.'),
  validationError,
  updateCurrentUser,
);

router.delete('/current', authenticate, authorize(['admin', 'user']), deleteCurrentUser);

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
  getAllUser,
);

router.get(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID.'),
  validationError,
  getUser,
);

router.delete(
  '/:userId',
  authenticate,
  authorize(['admin']),
  param('userId').notEmpty().isMongoId().withMessage('Invalid user ID.'),
  validationError,
  deleteUser,
);

export default router;
