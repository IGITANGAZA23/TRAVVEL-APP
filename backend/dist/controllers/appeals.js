"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppeals = exports.updateAppeal = exports.getAppeal = exports.getAppeals = exports.createAppeal = void 0;
const express_validator_1 = require("express-validator");
const Appeal_1 = __importDefault(require("../models/Appeal"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
// @desc    Create a new appeal
// @route   POST /api/appeals
// @access  Private
const createAppeal = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { ticketId, subject, description } = req.body;
        // Check if ticket exists and belongs to user
        const ticket = await Ticket_1.default.findOne({
            _id: ticketId,
            user: req.user._id,
        });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }
        // Check if there's already an open appeal for this ticket
        const existingAppeal = await Appeal_1.default.findOne({
            ticket: ticketId,
            status: { $in: ['pending', 'in_review'] },
        });
        if (existingAppeal) {
            return res.status(400).json({
                success: false,
                message: 'There is already an open appeal for this ticket',
            });
        }
        // Create appeal
        const appeal = new Appeal_1.default({
            user: req.user._id,
            ticket: ticketId,
            subject,
            description,
        });
        await appeal.save();
        res.status(201).json({
            success: true,
            data: appeal,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.createAppeal = createAppeal;
// @desc    Get all appeals for logged in user
// @route   GET /api/appeals
// @access  Private
const getAppeals = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.user._id };
        if (status) {
            query.status = status;
        }
        const appeals = await Appeal_1.default.find(query)
            .sort({ createdAt: -1 })
            .populate('ticket', 'ticketNumber status journeyDetails')
            .populate('resolvedBy', 'name email');
        res.status(200).json({
            success: true,
            count: appeals.length,
            data: appeals,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAppeals = getAppeals;
// @desc    Get single appeal
// @route   GET /api/appeals/:id
// @access  Private
const getAppeal = async (req, res) => {
    try {
        const appeal = await Appeal_1.default.findOne({
            _id: req.params.id,
            user: req.user._id,
        })
            .populate('ticket')
            .populate('resolvedBy', 'name email');
        if (!appeal) {
            return res.status(404).json({
                success: false,
                message: 'Appeal not found',
            });
        }
        res.status(200).json({
            success: true,
            data: appeal,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAppeal = getAppeal;
// @desc    Update appeal (admin only)
// @route   PUT /api/appeals/:id
// @access  Private/Admin
const updateAppeal = async (req, res) => {
    try {
        const { status, response } = req.body;
        const appeal = await Appeal_1.default.findById(req.params.id).populate('ticket');
        if (!appeal) {
            return res.status(404).json({
                success: false,
                message: 'Appeal not found',
            });
        }
        // Update status if provided
        if (status) {
            appeal.status = status;
            // If resolving/rejecting, set resolvedBy and resolvedAt
            if (['resolved', 'rejected'].includes(status)) {
                appeal.resolvedBy = req.user._id;
                appeal.resolvedAt = new Date();
            }
        }
        // Update response if provided
        if (response) {
            appeal.response = response;
        }
        await appeal.save();
        res.status(200).json({
            success: true,
            data: appeal,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateAppeal = updateAppeal;
// @desc    Get all appeals (admin only)
// @route   GET /api/appeals/admin/all
// @access  Private/Admin
const getAllAppeals = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const appeals = await Appeal_1.default.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('ticket', 'ticketNumber status')
            .populate('resolvedBy', 'name email');
        res.status(200).json({
            success: true,
            count: appeals.length,
            data: appeals,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAllAppeals = getAllAppeals;
