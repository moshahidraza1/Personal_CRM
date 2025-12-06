import {
    logInteraction,
    listInteractions,
    getInteraction,
    updateInteraction,
    deleteInteraction
} from '../controllers/interaction.controller.js';
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import validateRequest from '../middlewares/InputValidator.middleware.js';
import { body, param, query } from 'express-validator';

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     Interaction:
 *       type: object
 *       required:
 *         - contactId
 *         - type
 *         - occuredAt
 *         - notes
 *       properties:
 *         id:
 *           type: integer
 *           description: Interaction's unique identifier
 *         contactId:
 *           type: integer
 *           description: ID of the contact this interaction belongs to
 *         userId:
 *           type: integer
 *           description: ID of the user who logged the interaction
 *         type:
 *           type: string
 *           description: Type of interaction (e.g., meeting, call, email)
 *           example: "meeting"
 *         occuredAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the interaction occurred
 *         notes:
 *           type: string
 *           description: Notes about the interaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Interaction creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Interaction last update timestamp
 *       example:
 *         id: 1
 *         contactId: 5
 *         userId: 3
 *         type: "meeting"
 *         occuredAt: "2023-12-01T14:30:00Z"
 *         notes: "Discussed project timeline and budget"
 *         createdAt: "2023-12-01T14:35:00Z"
 *         updatedAt: "2023-12-01T14:35:00Z"
 *     
 *     InteractionInput:
 *       type: object
 *       required:
 *         - contactId
 *         - type
 *         - occuredAt
 *         - notes
 *       properties:
 *         contactId:
 *           type: integer
 *           description: ID of the contact this interaction belongs to
 *         type:
 *           type: string
 *           description: Type of interaction (e.g., meeting, call, email)
 *           example: "meeting"
 *         occuredAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the interaction occurred
 *         notes:
 *           type: string
 *           description: Notes about the interaction
 *       example:
 *         contactId: 5
 *         type: "meeting"
 *         occuredAt: "2023-12-01T14:30:00Z"
 *         notes: "Discussed project timeline and budget"
 *
 *     InteractionUpdateInput:
 *       type: object
 *       required:
 *         - interactionId
 *       properties:
 *         interactionId:
 *           type: integer
 *           description: ID of the interaction to update
 *         type:
 *           type: string
 *           description: Type of interaction (e.g., meeting, call, email)
 *           example: "call"
 *         occuredAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the interaction occurred
 *         notes:
 *           type: string
 *           description: Notes about the interaction
 *       example:
 *         interactionId: 1
 *         type: "call"
 *         occuredAt: "2023-12-02T10:00:00Z"
 *         notes: "Follow-up call to discuss next steps"
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Error description"
 */

/**
 * @swagger
 * /api/v1/interactions/log-interaction:
 *   post:
 *     summary: Log a new interaction with a contact
 *     tags:
 *       - Interactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InteractionInput'
 *     responses:
 *       200:
 *         description: Interaction logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: "Successfully added interaction log"
 *       401:
 *         description: Contact not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// logInteraction
router.post('/log-interaction', validateRequest([
    body('contactId').trim().escape().notEmpty().isNumeric().withMessage('Contact Id should be a valid number'),

    body('type').trim().escape().notEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime"),

    body('notes').trim().escape().notEmpty().isString().withMessage("Notes should be a string")
]), logInteraction);

/**
 * @swagger
 * /api/v1/interactions/list-interactions:
 *   get:
 *     summary: List all interactions for the authenticated user
 *     tags:
 *       - Interactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Interactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interaction'
 *                 message:
 *                   type: string
 *                   example: "Found 5 interactions"
 *       401:
 *         description: No interactions found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//listInteractions
router.get('/list-interactions', listInteractions);

/**
 * @swagger
 * /api/v1/interactions/get-interaction:
 *   get:
 *     summary: Get interactions by various filters
 *     tags:
 *       - Interactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: interactionId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by specific interaction ID
 *       - in: query
 *         name: contactId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by contact ID to get all interactions for a contact
 *       - in: query
 *         name: occuredAt
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by interaction date (can be ISO date string or YYYY-MM-DD format)
 *         example: "2023-12-01T14:30:00Z"
 *     responses:
 *       200:
 *         description: Interactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Found 3 interaction logs with provided filters"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Interaction'
 *       401:
 *         description: No parameters provided or no interactions found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//getInteraction
router.get('/get-interaction', validateRequest([
    query('interactionId').optional().trim().escape().notEmpty().isNumeric().withMessage("interactionId should be a number"),

    query('contactId').optional().trim().escape().notEmpty().isNumeric().withMessage("contactId should be a number"),

    query('occuredAt').optional().trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime")

]), getInteraction);

/**
 * @swagger
 * /api/v1/interactions/update-interaction:
 *   patch:
 *     summary: Update an existing interaction
 *     tags:
 *       - Interactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InteractionUpdateInput'
 *     responses:
 *       200:
 *         description: Interaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully updated interacton log"
 *       401:
 *         description: No data provided to update or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Interaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//updateInteraction
// interactionId, type, occuredAt, notes
router.patch('/update-interaction', validateRequest([
    body('interactionId').trim().escape().notEmpty().isNumeric().withMessage(' interactionId should be a valid number'),


    body('type').optional().trim().escape().notEmpty().isString().withMessage('type should be a string'),

    body('occuredAt').optional().trim().escape().notEmpty().isISO8601().withMessage("occured At should be a DateTime"),

    body('notes').optional().trim().escape().notEmpty().isString().withMessage("Notes should be a string")

]), updateInteraction);

/**
 * @swagger
 * /api/v1/interactions/delete-interaction:
 *   delete:
 *     summary: Delete an interaction
 *     tags:
 *       - Interactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interactionId
 *             properties:
 *               interactionId:
 *                 type: integer
 *                 description: ID of the interaction to delete
 *             example:
 *               interactionId: 1
 *     responses:
 *       200:
 *         description: Interaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted interaction"
 *       404:
 *         description: Interaction not found or unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
//deleteInteraction
router.delete('/delete-interaction', validateRequest([
    body('interactionId').trim().escape().notEmpty().isNumeric().withMessage(' interactionId should be a valid number')
]), deleteInteraction);

export default router;