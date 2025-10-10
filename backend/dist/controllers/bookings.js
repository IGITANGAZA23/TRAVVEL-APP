"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBookingStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const express_validator_1 = require("express-validator");
const Booking_1 = __importDefault(require("../models/Booking"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const availableTicketsService_1 = __importDefault(require("../services/availableTicketsService"));
const crypto_1 = __importDefault(require("crypto"));
// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { routeId, passengers, totalAmount, paymentStatus = 'pending', paymentId, } = req.body;
        // Validate route exists and has enough seats
        const route = availableTicketsService_1.default.getRouteById(routeId);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }
        if (route.availableSeats < passengers.length) {
            return res.status(400).json({
                success: false,
                message: `Only ${route.availableSeats} seats available, but ${passengers.length} passengers requested`
            });
        }
        // Create booking
        const booking = new Booking_1.default({
            user: req.user._id,
            route: {
                from: route.from,
                to: route.to,
                departureTime: route.departureTime,
                arrivalTime: route.arrivalTime,
            },
            passengers,
            totalAmount,
            paymentStatus,
            paymentId,
            routeId: route.id, // Store the route ID for reference
        });
        await booking.save();
        // Update available seats before creating tickets
        const seatUpdateSuccess = availableTicketsService_1.default.updateAvailableSeats(routeId, passengers.length);
        if (!seatUpdateSuccess) {
            await booking.remove(); // Rollback booking if seat update fails
            return res.status(400).json({
                success: false,
                message: 'Failed to reserve seats. Please try again.'
            });
        }
        // Create tickets for each passenger
        const tickets = await Promise.all(passengers.map(async (passenger, index) => {
            const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            // Create signed payload for QR code
            const secret = process.env.QR_SECRET || 'change_me_in_env';
            const payload = {
                tn: ticketNumber,
                uid: String(req.user._id),
                // Expiration time (e.g., 7 days) to reduce risk if leaked
                exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
            };
            const payloadStr = JSON.stringify(payload);
            const signature = crypto_1.default
                .createHmac('sha256', secret)
                .update(payloadStr)
                .digest('base64url');
            const qrData = Buffer.from(JSON.stringify({ ...payload, sig: signature })).toString('base64url');
            const ticket = new Ticket_1.default({
                booking: booking._id,
                user: req.user._id,
                ticketNumber,
                // Store signed payload (base64url) in qrCode field; frontend will render as QR
                qrCode: qrData,
                status: 'active',
                journeyDetails: {
                    from: route.from,
                    to: route.to,
                    departureTime: route.departureTime,
                    arrivalTime: route.arrivalTime,
                    seatNumber: passenger.seatNumber || `SEAT-${index + 1}`,
                },
                passenger: {
                    name: passenger.name,
                    age: passenger.age,
                    gender: passenger.gender,
                },
                price: totalAmount / passengers.length, // Assuming equal price per passenger
            });
            await ticket.save();
            return ticket;
        }));
        // Update booking with ticket references
        booking.tickets = tickets.map((ticket) => ticket._id);
        await booking.save();
        res.status(201).json({
            success: true,
            data: {
                booking,
                tickets,
                route: {
                    id: route.id,
                    from: route.from,
                    to: route.to,
                    agency: route.agency,
                    departureTime: route.departureTime,
                    arrivalTime: route.arrivalTime,
                    busType: route.busType
                }
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.createBooking = createBooking;
// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('tickets');
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBookings = getBookings;
// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
    try {
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate('tickets');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBooking = getBooking;
// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Update booking status
        booking.status = status;
        await booking.save();
        // If cancelling, also update associated tickets
        if (status === 'cancelled') {
            await Ticket_1.default.updateMany({ booking: booking._id }, { $set: { status: 'cancelled' } });
        }
        res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Only allow deletion of pending bookings
        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a booking that is not in pending status',
            });
        }
        // Return seats to available tickets if routeId exists
        if (booking.routeId) {
            const seatsToReturn = booking.passengers.length;
            availableTicketsService_1.default.addAvailableSeats(booking.routeId, seatsToReturn);
        }
        // Delete associated tickets
        await Ticket_1.default.deleteMany({ booking: booking._id });
        // Delete booking
        await booking.remove();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteBooking = deleteBooking;
