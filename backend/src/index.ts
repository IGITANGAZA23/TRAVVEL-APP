import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import ticketRoutes from './routes/tickets';
import appealRoutes from './routes/appeals';
import routeRoutes from './routes/routes';
import RouteModel from './models/Route';

// Create Express app
const app: Application = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(express.json());
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5173' 
    : process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.use(morgan('dev'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    });

    // Seed default routes if none exist
    const routeCount = await RouteModel.countDocuments();
    if (routeCount === 0) {
      await RouteModel.insertMany([
        { from: 'Kigali', to: 'Nyamasheke', agency: 'Ritco Ltd', departureTime: '12:00', arrivalTime: '18:00', price: 6000, availableSeats: 15, busType: 'Executive' },
        { from: 'Kigali', to: 'Bugesera', agency: 'Volcano Express', departureTime: '09:30', arrivalTime: '11:00', price: 1200, availableSeats: 32, busType: 'Standard' },
        { from: 'Kigali', to: 'Kayonza', agency: 'Kigali Coach', departureTime: '16:00', arrivalTime: '18:00', price: 2000, availableSeats: 22, busType: 'Standard' },
      ]);
      console.log('Seeded default routes');
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/routes', routeRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
