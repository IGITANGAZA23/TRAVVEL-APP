"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const appeals_1 = require("../controllers/appeals");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.protect);
/**
 * @swagger
 * /api/appeals:
 *   post:
 *     summary: Create a new appeal
 *     tags: [Appeals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *               - subject
 *               - description
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: Ticket ID
 *               subject:
 *                 type: string
 *                 example: "Refund Request"
 *               description:
 *                 type: string
 *                 example: "I would like to request a refund for my cancelled trip"
 *     responses:
 *       201:
 *         description: Appeal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appeal'
 *       400:
 *         description: Validation error
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
// User routes
router.post('/', [
    (0, express_validator_1.body)('ticketId', 'Ticket ID is required').isMongoId(),
    (0, express_validator_1.body)('subject', 'Subject is required').not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').not().isEmpty(),
], appeals_1.createAppeal);
/**
 * @swagger
 * /api/appeals:
 *   get:
 *     summary: Get all appeals for the logged-in user
 *     tags: [Appeals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_review, resolved, rejected]
 *         description: Filter appeals by status
 *     responses:
 *       200:
 *         description: List of user appeals
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
 *                     $ref: '#/components/schemas/Appeal'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
], appeals_1.getAppeals);
/**
 * @swagger
 * /api/appeals/{id}:
 *   get:
 *     summary: Get a specific appeal by ID
 *     tags: [Appeals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appeal ID
 *     responses:
 *       200:
 *         description: Appeal details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appeal'
 *       404:
 *         description: Appeal not found
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.get('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid appeal ID').isMongoId(),
], appeals_1.getAppeal);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
/**
 * @swagger
 * /api/appeals/admin/all:
 *   get:
 *     summary: Get all appeals (Admin only)
 *     tags: [Appeals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_review, resolved, rejected]
 *         description: Filter appeals by status
 *     responses:
 *       200:
 *         description: List of all appeals
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
 *                     $ref: '#/components/schemas/Appeal'
 *       403:
 *         description: Forbidden - Admin access required
 *         $ref: '#/components/schemas/Error'
 */
router.get('/admin/all', [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
], appeals_1.getAllAppeals);
/**
 * @swagger
 * /api/appeals/{id}:
 *   put:
 *     summary: Update an appeal (Admin only)
 *     tags: [Appeals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appeal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_review, resolved, rejected]
 *                 example: "resolved"
 *               response:
 *                 type: string
 *                 example: "Your appeal has been reviewed and approved"
 *     responses:
 *       200:
 *         description: Appeal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appeal'
 *       403:
 *         description: Forbidden - Admin access required
 *         $ref: '#/components/schemas/Error'
 */
router.put('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid appeal ID').isMongoId(),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    (0, express_validator_1.body)('response').optional().isString(),
], appeals_1.updateAppeal);
exports.default = router;
