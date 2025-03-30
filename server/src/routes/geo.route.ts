import {Router} from 'express';

import {authMiddleware} from '../middlewares/auth.middlware';
import {geoController} from '../controllers/geo.controller';
import {ENV} from '../env/env.config';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);

router.get('/cities', geoController.getCities);

/**
 * @swagger
 * security:
 *   - BearerAuth: []  # This indicates that Bearer token is required for authorization
 */

/**
 * @swagger
 * /soccer/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     responses:
 *       200:
 *         description: A list of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Error fetching countries
 */
router.get('/countries', geoController.getCountries);

export default router;
