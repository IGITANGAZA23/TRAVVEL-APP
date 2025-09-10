import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateDetails, updatePassword } from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    body('phoneNumber', 'Please include a valid phone number').optional().isMobilePhone(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  login
);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put(
  '/updatedetails',
  [
    body('name', 'Name is required').optional().not().isEmpty(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('phoneNumber', 'Please include a valid phone number').optional().isMobilePhone(),
  ],
  updateDetails
);
router.put(
  '/updatepassword',
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  updatePassword
);

export default router;
