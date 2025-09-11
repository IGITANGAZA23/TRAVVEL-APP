"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_1 = require("../controllers/users");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected and admin-only
router.use(auth_1.protect, (0, auth_1.authorize)('admin'));
// Get all users
router.get('/', users_1.getUsers);
// Get single user
router.get('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid user ID').isMongoId(),
], users_1.getUser);
// Update user
router.put('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid user ID').isMongoId(),
    (0, express_validator_1.body)('name').optional().isString(),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('role').optional().isIn(['user', 'admin']),
    (0, express_validator_1.body)('isVerified').optional().isBoolean(),
], users_1.updateUser);
// Delete user
router.delete('/:id', [
    (0, express_validator_1.param)('id', 'Please provide a valid user ID').isMongoId(),
], users_1.deleteUser);
exports.default = router;
