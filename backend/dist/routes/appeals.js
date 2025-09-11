"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const appeals_1 = require("../controllers/appeals");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.protect);
// User routes
router.post('/', [
    (0, express_validator_1.body)('ticketId', 'Ticket ID is required').isMongoId(),
    (0, express_validator_1.body)('subject', 'Subject is required').not().isEmpty(),
    (0, express_validator_1.body)('description', 'Description is required').not().isEmpty(),
], appeals_1.createAppeal);
router.get('/', [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
], appeals_1.getAppeals);
router.get('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid appeal ID').isMongoId(),
], appeals_1.getAppeal);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
router.get('/admin/all', [
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
], appeals_1.getAllAppeals);
router.put('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid appeal ID').isMongoId(),
    (0, express_validator_1.body)('status').optional().isIn(['pending', 'in_review', 'resolved', 'rejected']),
    (0, express_validator_1.body)('response').optional().isString(),
], appeals_1.updateAppeal);
exports.default = router;
