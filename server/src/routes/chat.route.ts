import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API for managing chats between users related to match experiences
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
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the chat
 *         matchExperienceId:
 *           type: string
 *           description: The ID of the match experience related to the chat
 *         matchExperienceCreatorId:
 *           type: string
 *           description: The ID of the match experience creator (user)
 *         visitorId:
 *           type: string
 *           description: The ID of the visitor user
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *           description: List of messages in the chat
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the chat was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the chat was last updated
 *     ChatMessage:
 *       type: object
 *       properties:
 *         senderId:
 *           type: string
 *           description: The ID of the sender user
 *         content:
 *           type: string
 *           description: The content of the chat message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp of when the message was sent
 */


/**
 * @swagger
 * security:
 *   - BearerAuth: []  # This indicates that Bearer token is required for authorization
 */

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get chats for a match experience, optionally filtered by visitor and creator IDs
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: query
 *         name: matchExperienceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the match experience for which chats are being retrieved
 *       - in: query
 *         name: visitorId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the visitor user (optional, to filter chats between specific users)
 *       - in: query
 *         name: matchExperienceCreatorId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the match experience creator (optional, to filter chats between specific users)
 *     responses:
 *       200:
 *         description: A list of chats for the specified match experience
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid or missing matchExperienceId
 *       500:
 *         description: Error fetching chats
 */
router.get('/', chatController.getChats);


export default router;
