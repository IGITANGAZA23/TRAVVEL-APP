"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Router } = require("express");
const { body, param, query } = require("express-validator");
const {
  getTickets,
  getTicket,
  verifyTicket,
  scanTicket,
  updateTicketStatus,
} = require("../controllers/tickets");
const { protect, authorize } = require("../middleware/auth");

const router = Router();

// ✅ All routes are protected — ensures req.user is available
router.use(protect);

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets for the logged-in user
 * @access  Private
 */
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["active", "used", "cancelled"])
      .withMessage("Invalid ticket status filter"),
  ],
  getTickets
);

/**
 * @route   GET /api/tickets/verify/:ticketNumber
 * @desc    Verify a ticket (for staff/admin scanning or verification)
 * @access  Private (Admin/Staff)
 * @note    Must appear above '/:id' to avoid route conflict
 */
router.get(
  "/verify/:ticketNumber",
  [
    param("ticketNumber", "Ticket number is required")
      .notEmpty()
      .isString()
      .withMessage("Ticket number must be a string"),
  ],
  authorize("admin", "staff"),
  verifyTicket
);

/**
 * @route   POST /api/tickets/scan
 * @desc    Scan a ticket using signed QR payload (for staff/admin)
 * @access  Private (Admin/Staff)
 */
router.post("/scan", authorize("admin", "staff"), scanTicket);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get a single ticket for the logged-in user
 * @access  Private
 */
router.get(
  "/:id",
  [
    param("id", "Please provide a valid ticket ID")
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
  ],
  getTicket
);

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update a ticket’s status (active, used, or cancelled)
 * @access  Private (User or Admin/Staff)
 */
router.put(
  "/:id/status",
  [
    param("id", "Please provide a valid ticket ID")
      .isMongoId()
      .withMessage("Invalid MongoDB ID format"),
    body("status", "Status is required")
      .isIn(["active", "used", "cancelled"])
      .withMessage("Status must be one of: active, used, cancelled"),
  ],
  updateTicketStatus
);

exports.default = router;
