import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createAppeal,
  getAppeals,
  getAppeal,
  updateAppeal,
  getAllAppeals,
} from '../controllers/appeals';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(protect);

// User routes
router.post(
  '/',
  [
    body('ticketId', 'Ticket ID is required').isMongoId(),
    body('subject', 'Subject is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
  ],
  createAppeal
);

router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
  ],
  getAppeals
);

router.get(
  '/:id',
  [
    param('id', 'Please provide a valid appeal ID').isMongoId(),
  ],
  getAppeal
);

// Admin routes
router.use(authorize('admin'));

router.get(
  '/admin/all',
  [
    query('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
  ],
  getAllAppeals
);

router.put(
  '/:id',
  [
    param('id', 'Please provide a valid appeal ID').isMongoId(),
    body('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    body('response').optional().isString(),
  ],
  updateAppeal
);

export default router;
