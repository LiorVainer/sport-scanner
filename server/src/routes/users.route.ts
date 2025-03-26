import express from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         picture:
 *           type: string
 *           description: URL to the user's profile picture
 *         password:
 *           type: string
 *           description: The user's password (minimum 8 characters)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the user details were last updated
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     description: Updates the user details by their ID. Requires authentication.
 *     security:
 *       - BearerAuth: []  # This indicates that Bearer token is required for authorization
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the user to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               picture:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Password must be at least 8 characters long
 *     responses:
 *       200:
 *         description: The user has been updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 picture:
 *                   type: string
 *       401:
 *         description: Unauthorized – if the token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, userController.updateUserById);

export default router;
