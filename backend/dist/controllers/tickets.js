"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTicket = exports.updateTicketStatus = exports.getTicket = exports.getTickets = void 0;
const Ticket_1 = __importDefault(require("../models/Ticket"));
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
