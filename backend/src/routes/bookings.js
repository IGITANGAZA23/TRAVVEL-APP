"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bookings_1 = require("../controllers/bookings");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.protect);
// Create a new booking
router.post('/', [
    (0, express_validator_1.body)('route.from', 'Departure location is required').not().isEmpty(),
    (0, express_validator_1.body)('route.to', 'Destination is required').not().isEmpty(),
    (0, express_validator_1.body)('route.departureTime', 'Departure time is required').isISO8601(),
    (0, express_validator_1.body)('route.arrivalTime', 'Arrival time is required').isISO8601(),
    (0, express_validator_1.body)('passengers', 'Passengers are required').isArray({ min: 1 }),
    (0, express_validator_1.body)('passengers.*.name', 'Passenger name is required').not().isEmpty(),
    (0, express_validator_1.body)('passengers.*.age', 'Passenger age is required').isInt({ min: 1, max: 120 }),
    (0, express_validator_1.body)('passengers.*.gender', 'Passenger gender is required').isIn(['male', 'female', 'other']),
    (0, express_validator_1.body)('passengers.*.seatNumber', 'Seat number is required').not().isEmpty(),
    (0, express_validator_1.body)('totalAmount', 'Total amount is required').isFloat({ min: 0 }),
    (0, express_validator_1.body)('paymentStatus').optional().isIn(['pending', 'paid', 'refunded', 'failed']),
], bookings_1.createBooking);
// Get all bookings for the logged-in user
router.get('/', bookings_1.getBookings);
// Get a single booking
router.get('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid booking ID').isMongoId(),
], bookings_1.getBooking);
// Update booking status
router.put('/:id/status', [
    (0, express_validator_1.param)('id', 'Please provide a valid booking ID').isMongoId(),
    (0, express_validator_1.body)('status', 'Status is required').isIn(['pending', 'confirmed', 'cancelled', 'completed']),
], bookings_1.updateBookingStatus);
// Delete a booking
router.delete('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid booking ID').isMongoId(),
], bookings_1.deleteBooking);
exports.default = router;
