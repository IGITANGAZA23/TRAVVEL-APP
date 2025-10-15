"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', [
    (0, express_validator_1.body)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    (0, express_validator_1.body)('phoneNumber', 'Please include a valid phone number').optional().isMobilePhone(),
], auth_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
], auth_1.login);
// Protected routes
router.use(auth_2.protect);
router.get('/me', auth_1.getMe);
router.put('/updatedetails', [
    (0, express_validator_1.body)('name', 'Name is required').optional().not().isEmpty(),
    (0, express_validator_1.body)('email', 'Please include a valid email').optional().isEmail(),
    (0, express_validator_1.body)('phoneNumber', 'Please include a valid phone number').optional().isMobilePhone(),
], auth_1.updateDetails);
router.put('/updatepassword', [
    (0, express_validator_1.body)('currentPassword', 'Current password is required').exists(),
    (0, express_validator_1.body)('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], auth_1.updatePassword);
exports.default = router;
