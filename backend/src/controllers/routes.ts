import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import RouteModel from '../models/Route';

// @desc    List routes with optional search
// @route   GET /api/routes
// @access  Public
export const listRoutes = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const filter: any = {};
    if (from) filter.from = new RegExp(String(from), 'i');
    if (to) filter.to = new RegExp(String(to), 'i');
    
    let routes = await RouteModel.find(filter).sort({ createdAt: -1 });

    // Auto-seed defaults if empty (can be disabled via AUTO_SEED_ROUTES=false)
    if (routes.length === 0 && process.env.AUTO_SEED_ROUTES !== 'false') {
      await RouteModel.insertMany([
        { from: 'Kigali', to: 'Nyamasheke', agency: 'Ritco Ltd', departureTime: '12:00', arrivalTime: '18:00', price: 6000, availableSeats: 15, busType: 'Executive' },
        { from: 'Kigali', to: 'Bugesera', agency: 'Volcano Express', departureTime: '09:30', arrivalTime: '11:00', price: 1200, availableSeats: 32, busType: 'Standard' },
        { from: 'Kigali', to: 'Kayonza', agency: 'Kigali Coach', departureTime: '16:00', arrivalTime: '18:00', price: 2000, availableSeats: 22, busType: 'Standard' },
      ]);
      routes = await RouteModel.find(filter).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


