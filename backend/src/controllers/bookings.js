"use strict";
const { validationResult } = require("express-validator");
const Booking = require("../models/Booking");
const Ticket = require("../models/Ticket");
// availableTicketsService is transpiled with a default export; support both require() shapes
const availableTicketsServiceImport = require("../services/availableTicketsService");
const availableTicketsService = availableTicketsServiceImport?.default || availableTicketsServiceImport;
const crypto = require("crypto");

// @desc Create a new booking
// @route POST /api/bookings
// @access Private
exports.createBooking = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }

    try {
    const {
        route,
        routeId: bodyRouteId,
        passengers,
        totalAmount,
        paymentStatus = "pending",
        paymentId,
    } = req.body;

    const routeId = bodyRouteId || route?.id;
    if (!routeId) {
        return res.status(400).json({
        success: false,
        message: "Route ID is required",
        });
    }

    const foundRoute = availableTicketsService.getRouteById(routeId);
    if (!foundRoute) {
        return res.status(404).json({
        success: false,
        message: "Route not found",
        });
    }

    if (foundRoute.availableSeats < passengers.length) {
        return res.status(400).json({
        success: false,
        message: `Only ${foundRoute.availableSeats} seats available, but ${passengers.length} passengers requested`,
        });
    }

    // ✅ Create booking linked to the current user
    const booking = new Booking({
        user: req.user._id,
        route: {
        from: foundRoute.from,
        to: foundRoute.to,
        departureTime: foundRoute.departureTime,
        arrivalTime: foundRoute.arrivalTime,
        },
        passengers,
        totalAmount,
        paymentStatus,
        paymentId,
        routeId: foundRoute.id,
    });

    await booking.save();

    // Update available seats
    const seatUpdateSuccess = availableTicketsService.updateAvailableSeats(routeId, passengers.length);
    if (!seatUpdateSuccess) {
        await booking.remove();
        return res.status(400).json({
        success: false,
        message: "Failed to reserve seats. Please try again.",
        });
    }

    // ✅ Create tickets owned by the same user
    const tickets = await Promise.all(
        passengers.map(async (passenger, index) => {
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const secret = process.env.QR_SECRET || "change_me_in_env";
        const payload = {
            tn: ticketNumber,
            uid: String(req.user._id),
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // expires in 7 days
        };
        const payloadStr = JSON.stringify(payload);
        const signature = crypto.createHmac("sha256", secret).update(payloadStr).digest("base64url");
        const qrData = Buffer.from(JSON.stringify({ ...payload, sig: signature })).toString("base64url");

        const ticket = new Ticket({
            booking: booking._id,
            user: req.user._id,
            ticketNumber,
            qrCode: qrData,
            status: "active",
            journeyDetails: {
            from: foundRoute.from,
            to: foundRoute.to,
            departureTime: foundRoute.departureTime,
            arrivalTime: foundRoute.arrivalTime,
            seatNumber: passenger.seatNumber || `SEAT-${index + 1}`,
            },
            passenger: {
            name: passenger.name,
            age: passenger.age,
            gender: passenger.gender,
            },
            price: totalAmount / passengers.length,
        });

        await ticket.save();
        return ticket;
        })
    );

    booking.tickets = tickets.map((t) => t._id);
    await booking.save();

    res.status(201).json({
        success: true,
        data: {
        booking,
        tickets,
            route: {
            id: foundRoute.id,
            from: foundRoute.from,
            to: foundRoute.to,
            agency: foundRoute.agency,
            departureTime: foundRoute.departureTime,
            arrivalTime: foundRoute.arrivalTime,
            busType: foundRoute.busType,
        },
        },
    });
    } catch (err) {
    console.error("Booking creation failed:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// @desc Get all bookings for logged-in user
// @route GET /api/bookings
// @access Private
exports.getBookings = async (req, res) => {
    try {
    const bookings = await Booking.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("tickets");

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
    });
    } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// @desc Get single booking
// @route GET /api/bookings/:id
// @access Private
exports.getBooking = async (req, res) => {
    try {
    const booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user._id,
    }).populate("tickets");

    if (!booking) {
        return res.status(404).json({
        success: false,
        message: "Booking not found",
        });
    }

    res.status(200).json({
        success: true,
        data: booking,
    });
    } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// @desc Update booking status (cancel, etc.)
// @route PUT /api/bookings/:id/status
// @access Private
exports.updateBookingStatus = async (req, res) => {
    try {
    const { status } = req.body;
    const booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!booking) {
        return res.status(404).json({
        success: false,
        message: "Booking not found",
        });
    }

    booking.status = status;
    await booking.save();

    if (status === "cancelled") {
        await Ticket.updateMany({ booking: booking._id }, { $set: { status: "cancelled" } });
    }

    res.status(200).json({ success: true, data: booking });
    } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Server Error" });
    }
};

// @desc Delete a pending booking
// @route DELETE /api/bookings/:id
// @access Private
exports.deleteBooking = async (req, res) => {
    try {
    const booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!booking) {
        return res.status(404).json({
        success: false,
        message: "Booking not found",
        });
    }

    if (booking.status !== "pending") {
        return res.status(400).json({
        success: false,
        message: "Cannot delete a booking that is not pending",
        });
    }

    if (booking.routeId) {
        const seatsToReturn = booking.passengers.length;
        availableTicketsService.addAvailableSeats(booking.routeId, seatsToReturn);
    }

    await Ticket.deleteMany({ booking: booking._id });
    await booking.remove();

    res.status(200).json({ success: true, data: {} });
    } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Server Error" });
    } 
};
