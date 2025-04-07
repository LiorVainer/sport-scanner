import {Router} from 'express';
import {packageController} from '../controllers/package.controller';
import {authMiddleware} from '../middlewares/auth.middlware';
import {ENV} from '../env/env.config';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Package
 *   description: API for generating travel + match packages
 */

/**
 * @swagger
 * /package/generate:
 *   post:
 *     summary: Generate a travel package with match filters
 *     tags: [Package]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PackageSearchFilters'
 *     responses:
 *       200:
 *         description: Generated travel packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Error generating package
 */
router.post('/generate', packageController.generatePackages);

router.post('/generate/stream', packageController.streamPackageGeneration);

export default router;
