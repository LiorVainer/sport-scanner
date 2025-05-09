import { Router } from 'express';
import { soccerController } from '../controllers/soccer.controller';
import { authMiddleware } from '../middlewares/auth.middlware';
import { ENV } from '../env/env.config';

const router = Router();

ENV.NODE_ENV === 'production' && router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Soccer
 *   description: API for soccer data (countries, leagues, venues, and teams)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Use your Bearer token for authentication.
 */

/**
 * @swagger
 * security:
 *   - BearerAuth: []
 */

/**
 * @swagger
 * /soccer/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []
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
router.get('/countries', soccerController.getCountries);

/**
 * @swagger
 * /soccer/leagues:
 *   get:
 *     summary: Get leagues by country or search by name
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *         description: The country for which leagues are being retrieved
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional league name to search or filter by (case-insensitive)
 *     responses:
 *       200:
 *         description: A list of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League'
 *       400:
 *         description: Missing required query (must provide at least country or name)
 *       500:
 *         description: Error fetching leagues
 */
router.get('/leagues', soccerController.getLeagues);

/**
 * @swagger
 * /soccer/venues:
 *   get:
 *     summary: Get all venues in a specific country
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *         description: The country for which venues are being retrieved
 *     responses:
 *       200:
 *         description: A list of venues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venue'
 *       500:
 *         description: Error fetching venues
 */
router.get('/venues', soccerController.getVenues);

/**
 * @swagger
 * /soccer/teams:
 *   get:
 *     summary: Get all teams by team name (min 3 characters)
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Team name to search (min 3 characters)
 *     responses:
 *       200:
 *         description: A list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       400:
 *         description: Team name is required and must be at least 3 characters
 *       500:
 *         description: Error fetching teams
 */
router.get('/teams', soccerController.getTeams);

export default router;
