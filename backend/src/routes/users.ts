import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/users';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes are protected and admin-only
router.use(protect, authorize('admin'));

// Get all users
router.get('/', getUsers);

// Get single user
router.get(
  '/:id',
  [
    param('id', 'Please provide a valid user ID').isMongoId(),
  ],
  getUser
);

// Update user
router.put(
  '/:id',
  [
    param('id', 'Please provide a valid user ID').isMongoId(),
    body('name').optional().isString(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['user', 'admin']),
    body('isVerified').optional().isBoolean(),
  ],
  updateUser
);

// Delete user
router.delete(
  '/:id',
  [
    param('id', 'Please provide a valid user ID').isMongoId(),
  ],
  deleteUser
);

export default router;
