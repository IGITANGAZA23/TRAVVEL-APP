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
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets for the logged-in user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, used, cancelled]
 *         description: Filter tickets by status
 *     responses:
 *       200:
 *         description: List of user tickets
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
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/tickets/verify/{ticketNumber}:
 *   get:
 *     summary: Verify a ticket (Admin/Staff only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number to verify
 *     responses:
 *       200:
 *         description: Ticket verification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Staff access required
 *         $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/tickets/scan:
 *   post:
 *     summary: Scan a ticket using QR code (Admin/Staff only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrData
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: QR code data to scan
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Invalid QR data
 *         $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Staff access required
 *         $ref: '#/components/schemas/Error'
 */
router.post("/scan", authorize("admin", "staff"), scanTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a single ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
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
 * @swagger
 * /api/tickets/{id}/status:
 *   put:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
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
 *                 enum: [active, used, cancelled]
 *                 example: "used"
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
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
