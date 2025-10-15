"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const routes_1 = require("../controllers/routes");
const router = (0, express_1.Router)();
// Get all routes
router.get('/', [
    (0, express_validator_1.query)('from').optional().isString(),
    (0, express_validator_1.query)('to').optional().isString(),
], routes_1.listRoutes);
// Search routes with filters
router.get('/search', [
    (0, express_validator_1.query)('from').optional().isString(),
    (0, express_validator_1.query)('to').optional().isString(),
    (0, express_validator_1.query)('agency').optional().isString(),
    (0, express_validator_1.query)('busType').optional().isString(),
    (0, express_validator_1.query)('routeType').optional().isString(),
    (0, express_validator_1.query)('maxPrice').optional().isNumeric(),
    (0, express_validator_1.query)('minSeats').optional().isNumeric(),
], routes_1.searchRoutes);
// Get route by ID
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
], routes_1.getRouteById);
// Get routes by origin and destination
router.get('/from/:from/to/:to', [
    (0, express_validator_1.param)('from').isString().notEmpty(),
    (0, express_validator_1.param)('to').isString().notEmpty(),
], routes_1.getRoutesByOriginDestination);
// Get all unique origins
router.get('/origins', routes_1.getOrigins);
// Get all unique destinations
router.get('/destinations', routes_1.getDestinations);
exports.default = router;
