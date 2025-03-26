import express from 'express';
import { fileController } from '../controllers/file.controller';
import { upload } from '../middlewares/file.middleware';
import { authMiddleware } from '../middlewares/auth.middlware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API for file upload and deletion
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
 * /files:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL to access the uploaded file
 *       400:
 *         description: File upload failed
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('file'), fileController.handleUpload);

/**
 * @swagger
 * /files/{url}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - BearerAuth: []  # Require Bearer token for this endpoint
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: File URL is required
 *       500:
 *         description: Failed to delete file
 */
router.delete('/:url', authMiddleware, fileController.deleteFile);

export default router;
