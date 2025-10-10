import { Router } from 'express';
import { query, param } from 'express-validator';
import { 
  listRoutes, 
  searchRoutes, 
  getRouteById, 
  getRoutesByOriginDestination,
  getOrigins,
  getDestinations
} from '../controllers/routes';

const router = Router();

// Get all routes
router.get(
  '/',
  [
    query('from').optional().isString(),
    query('to').optional().isString(),
  ],
  listRoutes
);

// Search routes with filters
router.get(
  '/search',
  [
    query('from').optional().isString(),
    query('to').optional().isString(),
    query('agency').optional().isString(),
    query('busType').optional().isString(),
    query('routeType').optional().isString(),
    query('maxPrice').optional().isNumeric(),
    query('minSeats').optional().isNumeric(),
  ],
  searchRoutes
);

// Get route by ID
router.get(
  '/:id',
  [
    param('id').isString().notEmpty(),
  ],
  getRouteById
);

// Get routes by origin and destination
router.get(
  '/from/:from/to/:to',
  [
    param('from').isString().notEmpty(),
    param('to').isString().notEmpty(),
  ],
  getRoutesByOriginDestination
);

// Get all unique origins
router.get('/origins', getOrigins);

// Get all unique destinations
router.get('/destinations', getDestinations);

export default router;


