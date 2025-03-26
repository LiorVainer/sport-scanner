import { Router } from 'express';
import { soccerController } from '../controllers/soccer.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = Router();

router.use(authMiddleware);

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
router.get('/countries', soccerController.getCountries);

/**
 * @swagger
 * /soccer/leagues:
 *   get:
 *     summary: Get all leagues in a specific country
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: true
 *         description: The country for which leagues are being retrieved
 *     responses:
 *       200:
 *         description: A list of leagues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/League'
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
 *       - BearerAuth: []  # Require Bearer token for this endpoint
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
 *     summary: Get all teams in a specific league and season
 *     tags: [Soccer]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         required: true
 *         description: The league for which teams are being retrieved
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *         required: false
 *         description: The season for which teams are being retrieved (optional, defaults to current season)
 *     responses:
 *       200:
 *         description: A list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Error fetching teams
 */
router.get('/teams', soccerController.getTeams);


export default router;
