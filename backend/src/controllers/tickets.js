"use strict";
const TicketModule = require("../models/Ticket");
const Ticket = TicketModule.default || TicketModule;
const crypto = require("crypto");

// @desc Get all tickets for logged-in user
// @route GET /api/tickets
// @access Private
exports.getTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const tickets = await Ticket.find(query).sort({ "journeyDetails.departureTime": -1 });
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Get single ticket
// @route GET /api/tickets/:id
// @access Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Scan & verify ticket via QR payload
// @route POST /api/tickets/scan
// @access Private (staff/admin)
exports.scanTicket = async (req, res) => {
  try {
    const { qr } = req.body;
    if (!qr) return res.status(400).json({ success: false, message: "QR payload required" });

    let payloadObj;
    try {
      payloadObj = JSON.parse(Buffer.from(qr, "base64url").toString("utf8"));
    } catch {
      return res.status(400).json({ success: false, message: "Invalid QR payload" });
    }

    const { tn, uid, exp, sig } = payloadObj || {};
    if (!tn || !uid || !exp || !sig) {
      return res.status(400).json({ success: false, message: "Missing QR fields" });
    }

    const secret = process.env.QR_SECRET || "change_me_in_env";
    const unsigned = JSON.stringify({ tn, uid, exp });
    const expectedSig = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
    if (sig !== expectedSig) {
      return res.status(400).json({ success: false, message: "Invalid QR signature" });
    }

    if (Date.now() > Number(exp)) {
      return res.status(400).json({ success: false, message: "QR code expired" });
    }

    const ticket = await Ticket.findOne({ ticketNumber: tn, status: "active" }).populate("user", "name email");
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found or inactive" });

    if (String(ticket.user?._id) !== String(uid)) {
      return res.status(400).json({ success: false, message: "QR does not match ticket owner" });
    }

    const today = new Date();
    const tDate = new Date(ticket.journeyDetails.departureTime);
    if (
      tDate.getDate() !== today.getDate() ||
      tDate.getMonth() !== today.getMonth() ||
      tDate.getFullYear() !== today.getFullYear()
    ) {
      return res.status(400).json({ success: false, message: "Ticket not valid for today" });
    }

    ticket.status = "used";
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error("Error scanning ticket:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Update ticket status
// @route PUT /api/tickets/:id/status
// @access Private
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    if (!["active", "used", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error("Error updating ticket:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Verify ticket manually
// @route GET /api/tickets/verify/:ticketNumber
// @access Private (staff/admin)
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await Ticket.findOne({ ticketNumber, status: "active" }).populate("user", "name email");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or already used/cancelled",
      });
    }

    const today = new Date();
    const tDate = new Date(ticket.journeyDetails.departureTime);
    if (
      tDate.getDate() !== today.getDate() ||
      tDate.getMonth() !== today.getMonth() ||
      tDate.getFullYear() !== today.getFullYear()
    ) {
      return res.status(400).json({ success: false, message: "Ticket not valid for today" });
    }

    ticket.status = "used";
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    console.error("Error verifying ticket:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
