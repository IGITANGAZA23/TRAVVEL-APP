import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookings';
import { protect } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(protect);

// Create a new booking
router.post(
  '/',
  [
    body('route.from', 'Departure location is required').not().isEmpty(),
    body('route.to', 'Destination is required').not().isEmpty(),
    body('route.departureTime', 'Departure time is required').isISO8601(),
    body('route.arrivalTime', 'Arrival time is required').isISO8601(),
    body('passengers', 'Passengers are required').isArray({ min: 1 }),
    body('passengers.*.name', 'Passenger name is required').not().isEmpty(),
    body('passengers.*.age', 'Passenger age is required').isInt({ min: 1, max: 120 }),
    body('passengers.*.gender', 'Passenger gender is required').isIn(['male', 'female', 'other']),
    body('passengers.*.seatNumber', 'Seat number is required').not().isEmpty(),
    body('totalAmount', 'Total amount is required').isFloat({ min: 0 }),
    body('paymentStatus').optional().isIn(['pending', 'paid', 'refunded', 'failed']),
  ],
  createBooking
);

// Get all bookings for the logged-in user
router.get('/', getBookings);

// Get a single booking
router.get(
  '/:id',
  [
    param('id', 'Please provide a valid booking ID').isMongoId(),
  ],
  getBooking
);

// Update booking status
router.put(
  '/:id/status',
  [
    param('id', 'Please provide a valid booking ID').isMongoId(),
    body('status', 'Status is required').isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  ],
  updateBookingStatus
);

// Delete a booking
router.delete(
  '/:id',
  [
    param('id', 'Please provide a valid booking ID').isMongoId(),
  ],
  deleteBooking
);

export default router;
