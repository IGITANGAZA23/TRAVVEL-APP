"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBookingStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const express_validator_1 = require("express-validator");
const Booking_1 = __importDefault(require("../models/Booking"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { route, passengers, totalAmount, paymentStatus = 'pending', paymentId, } = req.body;
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
        });
        await booking.save();
        // Create tickets for each passenger
        const tickets = await Promise.all(passengers.map(async (passenger) => {
            const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const ticket = new Ticket_1.default({
                booking: booking._id,
                user: req.user._id,
                ticketNumber,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketNumber}`,
                status: 'active',
                journeyDetails: {
                    from: route.from,
                    to: route.to,
                    departureTime: route.departureTime,
                    arrivalTime: route.arrivalTime,
                    seatNumber: passenger.seatNumber,
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
