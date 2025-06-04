import express from 'express';
import { groupController } from '../controllers/group.controller';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: API for managing travel groups
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
 *     CreateGroup:
 *       type: object
 *       required:
 *         - title
 *         - users
 *         - dates
 *         - maxBudget
 *       properties:
 *         title:
 *           type: string
 *           description: Name of the group
 *         users:
 *           type: array
 *           description: List of user IDs in the group
 *           items:
 *             type: string
 *         dates:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *             end:
 *               type: string
 *               format: date
 *         maxBudget:
 *           type: number
 *           description: Maximum budget for the group
 */

/**
 * @swagger
 * security:
 *   - BearerAuth: []
 */

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroup'
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid group data
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, groupController.createGroup);

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, groupController.getGroups);

/**
 * @swagger
 * /groups/package/{packageId}:
 *   get:
 *     summary: Get groups by package ID
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: List of groups for the package
 *       500:
 *         description: Server error
 */
router.get('/package/:packageId', authMiddleware, groupController.getGroupsByPackageId);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get a group by ID
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, groupController.getGroupById);

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *               dates:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                   end:
 *                     type: string
 *                     format: date
 *               maxBudget:
 *                 type: number
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, groupController.updateGroup);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, groupController.deleteGroup);

/**
 * @swagger
 * /groups/{groupId}/package/{packageId}:
 *   post:
 *     summary: Set a package for a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package set for group successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:groupId/package/:packageId', authMiddleware, groupController.setPackageForGroup);

/**
 * @swagger
 * /groups/{groupId}/package:
 *   delete:
 *     summary: Remove a package from a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Package removed from group successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete('/:groupId/package', authMiddleware, groupController.removePackageFromGroup);

/**
 * @swagger
 * /groups/{groupId}/suggested-package/{packageId}:
 *   post:
 *     summary: Add a suggested package to a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Suggested package added to group successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:groupId/suggested-package/:packageId', authMiddleware, groupController.addSuggestedPackage);

/**
 * @swagger
 * /groups/{groupId}/suggested-package/{packageId}:
 *   delete:
 *     summary: Remove a suggested package from a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Suggested package removed from group successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete('/:groupId/suggested-package/:packageId', authMiddleware, groupController.removeSuggestedPackage);

/**
 * @swagger
 * /groups/{groupId}/vote/{packageId}:
 *   post:
 *     summary: Vote for a package in a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Voted for package successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/:groupId/vote/:packageId', authMiddleware, groupController.voteForPackage);

/**
 * @swagger
 * /groups/{groupId}/vote:
 *   delete:
 *     summary: unvote for a package in a group
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *    responses:
 *       200:
 *         description: UnVoted for package successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete('/:groupId/vote', authMiddleware, groupController.unVoteForPackage);

export default router;
