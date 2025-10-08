import { Router } from 'express';
import { param, query, body } from 'express-validator';
import {
  getTickets,
  getTicket,
  updateTicketStatus,
  verifyTicket,
  scanTicket,
} from '../controllers/tickets';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(protect);

// Get all tickets for the logged-in user
router.get(
  '/',
  [
    query('status').optional().isIn(['active', 'used', 'cancelled']),
  ],
  getTickets
);

// Get a single ticket
router.get(
  '/:id',
  [
    param('id', 'Please provide a valid ticket ID').isMongoId(),
  ],
  getTicket
);

// Update ticket status
router.put(
  '/:id/status',
  [
    param('id', 'Please provide a valid ticket ID').isMongoId(),
    body('status', 'Status is required').isIn(['active', 'used', 'cancelled']),
  ],
  updateTicketStatus
);

// Verify ticket (for staff/admin)
router.get(
  '/verify/:ticketNumber',
  [
    param('ticketNumber', 'Ticket number is required').not().isEmpty(),
  ],
  authorize('admin', 'staff'),
  verifyTicket
);

// Scan ticket via signed QR payload (for staff/admin)
router.post(
  '/scan',
  authorize('admin', 'staff'),
  scanTicket
);

export default router;
