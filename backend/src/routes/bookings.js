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
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passengers
 *               - totalAmount
 *             properties:
 *               routeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               route:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     example: "Kigali"
 *                   to:
 *                     type: string
 *                     example: "Nyamasheke"
 *                   departureTime:
 *                     type: string
 *                     format: date-time
 *                   arrivalTime:
 *                     type: string
 *                     format: date-time
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - age
 *                     - gender
 *                     - seatNumber
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     age:
 *                       type: number
 *                       minimum: 1
 *                       maximum: 120
 *                       example: 30
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                       example: "male"
 *                     seatNumber:
 *                       type: string
 *                       example: "A1"
 *               totalAmount:
 *                 type: number
 *                 example: 6000
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, refunded, failed]
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or insufficient seats
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.get("/", getBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a specific booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.get(
  "/:id",
  [param("id", "Please provide a valid booking ID").isMongoId()],
  getBooking
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Booking not found
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:id",
  [param("id", "Please provide a valid booking ID").isMongoId()],
  deleteBooking
);

exports.default = router;
