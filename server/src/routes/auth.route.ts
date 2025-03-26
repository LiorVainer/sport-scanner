import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth management API
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     PublicUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "67daf63a7d59e2068372d409"
 *         username:
 *           type: string
 *           example: "ליאור ויינר"
 *         email:
 *           type: string
 *           example: "liorvainer@gmail.com"
 *         picture:
 *           type: string
 *           format: uri
 *           example: "https://lh3.googleusercontent.com/a/ACg8ocLl4XDoHxa74SxG48duAid4hed8OHsW41RG-Avsvj1Fj55dntmmCg=s96-c"
 *         googleId:
 *           type: string
 *           example: "113571103984968642366"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-19T16:52:10.857Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-19T16:52:40.837Z"
 *         __v:
 *           type: integer
 *           example: 3
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token for authentication
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         _id:
 *           type: string
 *           example: "67daf63a7d59e2068372d409"
 *         username:
 *           type: string
 *           example: "ליאור ויינר"
 *         email:
 *           type: string
 *           example: "liorvainer@gmail.com"
 *         picture:
 *           type: string
 *           format: uri
 *           example: "https://lh3.googleusercontent.com/a/ACg8ocLl4XDoHxa74SxG48duAid4hed8OHsW41RG-Avsvj1Fj55dntmmCg=s96-c"
 *         googleId:
 *           type: string
 *           example: "113571103984968642366"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-19T16:52:10.857Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-03-19T19:18:05.795Z"
 *         __v:
 *           type: integer
 *           example: 4
 *
 *     RegisterUser:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "liorvainer@gmail.com"
 *         username:
 *           type: string
 *           example: "ליאור ויינר"
 *         password:
 *           type: string
 *           format: password
 *           example: "securepassword123"
 *         picture:
 *           type: string
 *           format: uri
 *           example: "https://example.com/profile-picture.jpg"
 *
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "liorvainer@gmail.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "securepassword123"
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: The refresh token used for generating new access tokens
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     LogoutRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: The refresh token of the user to be logged out
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user details
 *     tags: [Auth]
 *     description: Retrieves the authenticated user’s details using the provided JWT token.
 *     security:
 *       - BearerAuth: []  # Bearer token required for authentication
 *     responses:
 *       200:
 *         description: Returns user information (excluding password and refresh tokens)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       401:
 *         description: Unauthorized – Token not found or invalid
 *       500:
 *         description: Server error
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login with Google
 *     tags: [Auth]
 *     description: Authenticates the user using Google login via Google token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Returns authenticated user and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid Google token
 *       500:
 *         description: Internal server error
 */
router.post('/google', authController.googleLogin);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Registers a new user with email, username, password, and picture.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       200:
 *         description: Returns user details and tokens after registration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     description: Logs in a user using email and password, and returns authentication tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Returns authenticated user and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication tokens
 *     tags: [Auth]
 *     description: Refreshes the access token using a valid refresh token.
 *     security:
 *       - BearerAuth: []  # Bearer token required for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token used for generating new access tokens
 *     responses:
 *       200:
 *         description: Returns new access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     description: Logs out the user by invalidating their refresh token.
 *     security:
 *       - BearerAuth: []  # Bearer token required for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token of the user to be logged out
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/logout', authMiddleware, authController.logout);

export default router;
