"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { body, param } = require("express-validator");
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookings");
const { protect } = require("../middleware/auth");

const router = (0, express_1.Router)();

// ✅ Protect all routes — ensures req.user is attached
router.use(protect);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking for the logged-in user
 * @access  Private
 */
router.post(
  "/",
  [
    body("routeId")
      .optional()
      .isString()
      .withMessage("Route ID must be a string if provided."),

    body("route.from")
      .if(body("route").exists())
      .notEmpty()
      .withMessage("Departure location is required when route object is used."),
    body("route.to")
      .if(body("route").exists())
      .notEmpty()
      .withMessage("Destination is required when route object is used."),
    body("route.departureTime")
      .if(body("route").exists())
      .isISO8601()
      .withMessage("Departure time must be a valid date."),
    body("route.arrivalTime")
      .if(body("route").exists())
      .isISO8601()
      .withMessage("Arrival time must be a valid date."),

    body("passengers", "Passengers are required").isArray({ min: 1 }),
    body("passengers.*.name", "Passenger name is required").not().isEmpty(),
    body("passengers.*.age", "Passenger age must be between 1 and 120").isInt({
      min: 1,
      max: 120,
    }),
    body("passengers.*.gender", "Passenger gender is required").isIn([
      "male",
      "female",
      "other",
    ]),
    body("passengers.*.seatNumber", "Seat number is required").not().isEmpty(),

    body("totalAmount", "Total amount is required").isFloat({ min: 0 }),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "refunded", "failed"]),
  ],
  createBooking
);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the logged-in user
 * @access  Private
 */
router.get("/", getBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get details of a specific booking belonging to the user
 * @access  Private
 */
router.get(
  "/:id",
  [param("id", "Please provide a valid booking ID").isMongoId()],
  getBooking
);

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update the booking status (user or admin)
 * @access  Private
 */
router.put(
  "/:id/status",
  [
    param("id", "Please provide a valid booking ID").isMongoId(),
    body("status", "Status is required").isIn([
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ]),
  ],
  updateBookingStatus
);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a user’s booking
 * @access  Private
 */
router.delete(
  "/:id",
  [param("id", "Please provide a valid booking ID").isMongoId()],
  deleteBooking
);

exports.default = router;
