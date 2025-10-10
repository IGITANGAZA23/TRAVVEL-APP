"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const tickets_1 = require("../controllers/tickets");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.protect);
// Get all tickets for the logged-in user
router.get('/', [
    (0, express_validator_1.query)('status').optional().isIn(['active', 'used', 'cancelled']),
], tickets_1.getTickets);
// Get a single ticket
router.get('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid ticket ID').isMongoId(),
], tickets_1.getTicket);
// Update ticket status
router.put('/:id/status', [
    (0, express_validator_1.param)('id', 'Please provide a valid ticket ID').isMongoId(),
    (0, express_validator_1.body)('status', 'Status is required').isIn(['active', 'used', 'cancelled']),
], tickets_1.updateTicketStatus);
// Verify ticket (for staff/admin)
router.get('/verify/:ticketNumber', [
    (0, express_validator_1.param)('ticketNumber', 'Ticket number is required').not().isEmpty(),
], (0, auth_1.authorize)('admin', 'staff'), tickets_1.verifyTicket);
// Scan ticket via signed QR payload (for staff/admin)
router.post('/scan', (0, auth_1.authorize)('admin', 'staff'), tickets_1.scanTicket);
exports.default = router;
