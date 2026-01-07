"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const routes_1 = require("../controllers/routes");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Filter by departure location
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Filter by destination
 *     responses:
 *       200:
 *         description: List of routes
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
 *                     $ref: '#/components/schemas/Route'
 */
// Get all routes
router.get('/', [
    (0, express_validator_1.query)('from').optional().isString(),
    (0, express_validator_1.query)('to').optional().isString(),
], routes_1.listRoutes);
/**
 * @swagger
 * /api/routes/search:
 *   get:
 *     summary: Search routes with filters
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Departure location
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Destination
 *       - in: query
 *         name: agency
 *         schema:
 *           type: string
 *         description: Bus agency name
 *       - in: query
 *         name: busType
 *         schema:
 *           type: string
 *         description: Type of bus
 *       - in: query
 *         name: routeType
 *         schema:
 *           type: string
 *         description: Route type
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: minSeats
 *         schema:
 *           type: number
 *         description: Minimum available seats
 *     responses:
 *       200:
 *         description: Filtered routes
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
 *                     $ref: '#/components/schemas/Route'
 */
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
/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 *         $ref: '#/components/schemas/Error'
 */
// Get route by ID
router.get('/:id', [
    (0, express_validator_1.param)('id').isString().notEmpty(),
], routes_1.getRouteById);
/**
 * @swagger
 * /api/routes/from/{from}/to/{to}:
 *   get:
 *     summary: Get routes by origin and destination
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Departure location
 *       - in: path
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination
 *     responses:
 *       200:
 *         description: Routes matching origin and destination
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
 *                     $ref: '#/components/schemas/Route'
 */
// Get routes by origin and destination
router.get('/from/:from/to/:to', [
    (0, express_validator_1.param)('from').isString().notEmpty(),
    (0, express_validator_1.param)('to').isString().notEmpty(),
], routes_1.getRoutesByOriginDestination);
/**
 * @swagger
 * /api/routes/origins:
 *   get:
 *     summary: Get all unique origin locations
 *     tags: [Routes]
 *     security: []
 *     responses:
 *       200:
 *         description: List of unique origins
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
 *                     type: string
 */
// Get all unique origins
router.get('/origins', routes_1.getOrigins);
/**
 * @swagger
 * /api/routes/destinations:
 *   get:
 *     summary: Get all unique destination locations
 *     tags: [Routes]
 *     security: []
 *     responses:
 *       200:
 *         description: List of unique destinations
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
 *                     type: string
 */
// Get all unique destinations
router.get('/destinations', routes_1.getDestinations);
exports.default = router;
