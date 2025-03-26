import { Router } from 'express';
import { matchExperienceController } from '../controllers/match-experience.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: MatchExperiences
 *   description: Match Experience management API
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
 *
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - _id
 *         - matchExperienceId
 *         - userId
 *         - content
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the comment
 *           example: "67dacda28919860ef0a10384"
 *         matchExperienceId:
 *           type: string
 *           description: The ID of the match experience being commented on
 *           example: "67da9113c748e6d02ba1f469"
 *         userId:
 *           type: string
 *           description: The ID of the user who made the comment
 *           example: "67dabb1e89aa87b0390c4c6f"
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: "vvvv"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was created
 *           example: "2025-03-19T13:58:58.397Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was last updated
 *           example: "2025-03-19T13:58:58.397Z"
 *         __v:
 *           type: integer
 *           description: Version key for document changes tracking
 *           example: 0
 *
 *     PopulatedComment:
 *       type: object
 *       required:
 *         - _id
 *         - matchExperienceId
 *         - userId
 *         - content
 *         - createdAt
 *         - updatedAt
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the comment
 *           example: "67db1efa81cd8cfa67c44efe"
 *         matchExperienceId:
 *           type: string
 *           description: The ID of the match experience being commented on
 *           example: "67db1eea81cd8cfa67c44ef2"
 *         userId:
 *           type: string
 *           description: The ID of the user who made the comment
 *           example: "67daf63a7d59e2068372d409"
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: "awdwadwad"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was created
 *           example: "2025-03-19T19:46:02.496Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was last updated
 *           example: "2025-03-19T19:46:02.496Z"
 *         __v:
 *           type: integer
 *           description: Version key for document changes tracking
 *           example: 0
 *         user:
 *           $ref: '#/components/schemas/PublicUser'
 *
 *     CommentPayload:
 *       type: object
 *       required:
 *         - matchExperienceId
 *         - userId
 *         - content
 *         - createdAt
 *       properties:
 *         matchExperienceId:
 *           type: string
 *           description: The ID of the match experience being commented on
 *         userId:
 *           type: string
 *           description: The ID of the user who made the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the comment was created
 *
 *     PopulatedMatchExperience:
 *       type: object
 *       required:
 *         - homeTeam
 *         - awayTeam
 *         - matchDate
 *         - league
 *         - country
 *         - stadium
 *         - title
 *         - description
 *       properties:
 *         homeTeam:
 *           type: string
 *           description: The name of the home team
 *         awayTeam:
 *           type: string
 *           description: The name of the away team
 *         matchDate:
 *           type: string
 *           format: date-time
 *           description: The date and time of the match
 *         league:
 *           type: string
 *           description: The league of the match
 *         country:
 *           type: string
 *           description: The country of the match
 *         stadium:
 *           type: string
 *           description: The stadium where the match will be held
 *         title:
 *           type: string
 *           description: The title of the match experience
 *         description:
 *           type: string
 *           description: A detailed description of the match experience
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the match experience
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of user IDs who liked the match experience
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PopulatedComment'
 *           description: A list of populated comments including user details
 *         picture:
 *           type: string
 *           description: Optional picture URL for the match experience
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the match experience was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time when the match experience was last updated
 *
 *     MatchExperience:
 *       type: object
 *       required:
 *         - homeTeam
 *         - awayTeam
 *         - matchDate
 *         - league
 *         - country
 *         - stadium
 *         - title
 *         - description
 *       properties:
 *         homeTeam:
 *           type: string
 *           description: The name of the home team
 *         awayTeam:
 *           type: string
 *           description: The name of the away team
 *         matchDate:
 *           type: string
 *           format: date-time
 *           description: The date and time of the match
 *         league:
 *           type: string
 *           description: The league of the match
 *         country:
 *           type: string
 *           description: The country of the match
 *         stadium:
 *           type: string
 *           description: The stadium where the match will be held
 *         title:
 *           type: string
 *           description: The title of the matchExperience
 *         description:
 *           type: string
 *           description: A detailed description of the matchExperience
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the matchExperience
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: A list of user IDs who liked the matchExperience
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: A list of comments on the matchExperience
 *         picture:
 *           type: string
 *           description: Optional picture URL for the matchExperience
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time when the matchExperience was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time when the matchExperience was last updated
 */

/**
 * @swagger
 * security:
 *   - BearerAuth: []  # This indicates that Bearer token is required for authorization
 */

/**
 * @swagger
 * /match-experiences:
 *   post:
 *     summary: Create a new matchExperience
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - homeTeam
 *               - awayTeam
 *               - matchDate
 *               - league
 *               - country
 *               - stadium
 *               - title
 *               - description
 *             properties:
 *               homeTeam:
 *                 type: string
 *               awayTeam:
 *                 type: string
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               league:
 *                 type: string
 *               country:
 *                 type: string
 *               stadium:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created match experience
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchExperience'
 *       500:
 *         description: Error creating match experience
 */
router.post('/', matchExperienceController.createMatchExperience);

/**
 * @swagger
 * /match-experiences:
 *   get:
 *     summary: Get all match experiences
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     responses:
 *       200:
 *         description: A list of match experiences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchExperience'
 *       500:
 *         description: Error fetching match experiences
 */
router.get('/', matchExperienceController.getAll);

/**
 * @swagger
 * /match-experiences/better-description:
 *   get:
 *     summary: Generate a better match experience description
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: query
 *         name: homeTeam
 *         schema:
 *           type: string
 *         required: false
 *         description: The home team name
 *       - in: query
 *         name: awayTeam
 *         schema:
 *           type: string
 *         required: false
 *         description: The away team name
 *       - in: query
 *         name: matchDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: The date and time of the match
 *       - in: query
 *         name: league
 *         schema:
 *           type: string
 *         required: false
 *         description: The league of the match
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         required: false
 *         description: The country where the match is played
 *       - in: query
 *         name: stadium
 *         schema:
 *           type: string
 *         required: false
 *         description: The stadium where the match is played
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: The title of the match experience
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         required: false
 *         description: A brief description of the match experience
 *     responses:
 *       200:
 *         description: The AI-generated match experience description
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "A thrilling match where the home team made a last-minute comeback, sending the fans into a frenzy!"
 *       500:
 *         description: Error generating match experience description
 */
router.get('/better-description', matchExperienceController.betterDescription);

/**
 * @swagger
 * /match-experiences/user/{userId}:
 *   get:
 *     summary: Get all match experiences created by a specific user
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose match experiences are being retrieved
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of items per page (default is 5)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, likes]
 *         required: false
 *         description: Sorting criteria (default is "date", alternative is "likes")
 *     responses:
 *       200:
 *         description: A paginated list of match experiences created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 experiences:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MatchExperience'
 *                 totalPages:
 *                   type: integer
 *       404:
 *         description: No match experiences found for the given user ID
 *       500:
 *         description: Error fetching match experiences
 */
router.get('/user/:userId', matchExperienceController.getAllByUserId);

/**
 * @swagger
 * /match-experiences/{id}:
 *   get:
 *     summary: Get a matchExperience by ID
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     responses:
 *       200:
 *         description: The match experience data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopulatedMatchExperience'
 *       404:
 *         description: match experience not found
 *       500:
 *         description: Error fetching match experience
 */
router.get('/:id', matchExperienceController.getMatchExperienceById);

/**
 * @swagger
 * /match-experiences/{id}:
 *   put:
 *     summary: Update a matchExperience by ID
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeTeam:
 *                 type: string
 *               awayTeam:
 *                 type: string
 *               matchDate:
 *                 type: string
 *                 format: date-time
 *               league:
 *                 type: string
 *               country:
 *                 type: string
 *               stadium:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated match experience
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchExperience'
 *       404:
 *         description: match experience not found
 *       500:
 *         description: Error updating match experience
 */
router.put('/:id', matchExperienceController.updateMatchExperience);

/**
 * @swagger
 * /match-experiences/{id}:
 *   delete:
 *     summary: Delete a match experience by ID
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     responses:
 *       200:
 *         description: The deleted match experience
 *       404:
 *         description: match experience not found
 *       500:
 *         description: Error deleting match experience
 */
router.delete('/:id', matchExperienceController.deleteMatchExperience);

/**
 * @swagger
 * /match-experiences/{id}/comments:
 *   post:
 *     summary: Add a comment to a match experience
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentPayload'
 *     responses:
 *       200:
 *         description: The comment has been added
 *       500:
 *         description: Error adding comment
 */
router.post('/:id/comments', matchExperienceController.addComment);

/**
 * @swagger
 * /match-experiences/{id}/like:
 *   post:
 *     summary: Like a match experience
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     responses:
 *       200:
 *         description: match experience liked
 *       500:
 *         description: Error liking match experience
 */
router.post('/:id/like', matchExperienceController.likeMatchExperience);

/**
 * @swagger
 * /match-experiences/{id}/unlike:
 *   post:
 *     summary: UnLike a match experience
 *     tags: [MatchExperiences]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match experience ID
 *     responses:
 *       200:
 *         description: match experience unliked
 *       500:
 *         description: Error unliking match experience
 */
router.post('/:id/unlike', matchExperienceController.unlikeMatchExperience);

export default router;
