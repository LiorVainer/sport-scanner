import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middlware';
import { geoController } from '../controllers/geo.controller';
import { ENV } from '../env/env.config';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);

router.get('/cities', geoController.getCities);

export default router;
