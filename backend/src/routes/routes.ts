import { Router } from 'express';
import { query } from 'express-validator';
import { listRoutes } from '../controllers/routes';

const router = Router();

router.get(
  '/',
  [
    query('from').optional().isString(),
    query('to').optional().isString(),
  ],
  listRoutes
);

export default router;


