"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTicket = exports.updateTicketStatus = exports.scanTicket = exports.getTicket = exports.getTickets = void 0;
const Ticket_1 = __importDefault(require("../models/Ticket"));
const crypto_1 = __importDefault(require("crypto"));
// @desc    Get all tickets for logged in user
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.user._id };
        if (status) {
            query.status = status;
        }
        const tickets = await Ticket_1.default.find(query)
            .sort({ 'journeyDetails.departureTime': -1 });
        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTickets = getTickets;
// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
    try {
        const ticket = await Ticket_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }
        res.status(200).json({
            success: true,
            data: ticket,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTicket = getTicket;
// @desc    Scan and verify ticket via signed QR payload
// @route   POST /api/tickets/scan
// @access  Private (For staff/admin)
const scanTicket = async (req, res) => {
    var _a;
    try {
        const { qr } = req.body;
        if (!qr) {
            return res.status(400).json({ success: false, message: 'QR payload is required' });
        }
        // Decode base64url payload
        let payloadObj;
        try {
            const jsonStr = Buffer.from(qr, 'base64url').toString('utf8');
            payloadObj = JSON.parse(jsonStr);
        }
        catch (_b) {
            return res.status(400).json({ success: false, message: 'Invalid QR payload' });
        }
        const { tn, uid, exp, sig } = payloadObj || {};
        if (!tn || !uid || !exp || !sig) {
            return res.status(400).json({ success: false, message: 'QR payload missing fields' });
        }
        // Verify signature
        const secret = process.env.QR_SECRET || 'change_me_in_env';
        const unsigned = JSON.stringify({ tn, uid, exp });
        const expectedSig = crypto_1.default.createHmac('sha256', secret).update(unsigned).digest('base64url');
        if (sig !== expectedSig) {
            return res.status(400).json({ success: false, message: 'Invalid QR signature' });
        }
        // Check expiration
        if (Date.now() > Number(exp)) {
            return res.status(400).json({ success: false, message: 'QR code expired' });
        }
        // Find active ticket by ticketNumber
        const ticket = await Ticket_1.default.findOne({ ticketNumber: tn, status: 'active' }).populate('user', 'name email');
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found or not active' });
        }
        // Ensure the QR uid matches the ticket owner
        if (String((_a = ticket.user) === null || _a === void 0 ? void 0 : _a._id) !== String(uid)) {
            return res.status(400).json({ success: false, message: 'QR does not match ticket owner' });
        }
        // Validate date is today
        const today = new Date();
        const ticketDate = new Date(ticket.journeyDetails.departureTime);
        if (ticketDate.getDate() !== today.getDate() ||
            ticketDate.getMonth() !== today.getMonth() ||
            ticketDate.getFullYear() !== today.getFullYear()) {
            return res.status(400).json({ success: false, message: 'Ticket is not valid for today' });
        }
        // Mark as used
        ticket.status = 'used';
        await ticket.save();
        return res.status(200).json({ success: true, data: ticket });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.scanTicket = scanTicket;
// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }
        // Only allow certain status updates
        if (!['active', 'used', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status update',
            });
        }
        ticket.status = status;
        await ticket.save();
        res.status(200).json({
            success: true,
            data: ticket,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateTicketStatus = updateTicketStatus;
// @desc    Verify ticket
// @route   GET /api/tickets/verify/:ticketNumber
// @access  Private (For staff/admin)
const verifyTicket = async (req, res) => {
    try {
        const { ticketNumber } = req.params;
        const ticket = await Ticket_1.default.findOne({
            ticketNumber,
            status: 'active',
        }).populate('user', 'name email');
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or already used/cancelled',
            });
        }
        // Check if ticket is for today
        const today = new Date();
        const ticketDate = new Date(ticket.journeyDetails.departureTime);
        if (ticketDate.getDate() !== today.getDate() ||
            ticketDate.getMonth() !== today.getMonth() ||
            ticketDate.getFullYear() !== today.getFullYear()) {
            return res.status(400).json({
                success: false,
                message: 'Ticket is not valid for today',
            });
        }
        // Mark ticket as used
        ticket.status = 'used';
        await ticket.save();
        res.status(200).json({
            success: true,
            data: ticket,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.verifyTicket = verifyTicket;
