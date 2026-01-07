"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const appeals_1 = __importDefault(require("./routes/appeals"));
const routes_1 = __importDefault(require("./routes/routes"));
const Route_1 = __importDefault(require("./models/Route"));
// Create Express app
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
// Middleware
app.use(express_1.default.json());
const corsOptions = {
    origin: process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions)); // Enable preflight for all routes
app.use((0, morgan_1.default)('dev'));
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TRAVVEL API Documentation'
}));
// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`MongoDB Connected: ${mongoose_1.default.connection.host}`);
        });
        // Seed default routes if none exist
        const routeCount = await Route_1.default.countDocuments();
        if (routeCount === 0) {
            await Route_1.default.insertMany([
                { from: 'Kigali', to: 'Nyamasheke', agency: 'Ritco Ltd', departureTime: '12:00', arrivalTime: '18:00', price: 6000, availableSeats: 15, busType: 'Executive' },
                { from: 'Kigali', to: 'Bugesera', agency: 'Volcano Express', departureTime: '09:30', arrivalTime: '11:00', price: 1200, availableSeats: 32, busType: 'Standard' },
                { from: 'Kigali', to: 'Kayonza', agency: 'Kigali Coach', departureTime: '16:00', arrivalTime: '18:00', price: 2000, availableSeats: 22, busType: 'Standard' },
            ]);
            console.log('Seeded default routes');
        }
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/tickets', tickets_1.default);
app.use('/api/appeals', appeals_1.default);
app.use('/api/routes', routes_1.default);
// Health check endpoint
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
// Start server
const startServer = async () => {
    try {
        await connectDB();
        // Server is started in connectDB after a successful DB connection
        console.log(`Server initialized in ${process.env.NODE_ENV} mode`);
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
