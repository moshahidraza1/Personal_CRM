import {
    recentlyContacted,
    staleContacts,
    contactSummary,
    overallMetrics,
    mostInteractedContacts
} from "../controllers/insights.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     RecentContact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Contact's unique identifier
 *         firstName:
 *           type: string
 *           description: Contact's first name
 *         lastName:
 *           type: string
 *           description: Contact's last name
 *         company:
 *           type: string
 *           description: Contact's company
 *         jobRole:
 *           type: string
 *           description: Contact's job role
 *       example:
 *         id: 1
 *         firstName: "John"
 *         lastName: "Doe"
 *         company: "Acme Corp"
 *         jobRole: "Software Engineer"
 *
 *     StaleContact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Contact's unique identifier
 *         firstName:
 *           type: string
 *           description: Contact's first name
 *         lastName:
 *           type: string
 *           description: Contact's last name
 *         company:
 *           type: string
 *           description: Contact's company
 *         jobRole:
 *           type: string
 *           description: Contact's job role
 *         lastContacted:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last contact date (null if never contacted)
 *       example:
 *         id: 2
 *         firstName: "Jane"
 *         lastName: "Smith"
 *         company: "Tech Inc"
 *         jobRole: "Product Manager"
 *         lastContacted: "2023-10-15T10:30:00Z"
 *
 *     ContactSummary:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Type of interaction
 *         total_interactions:
 *           type: integer
 *           description: Total number of interactions for this type
 *       example:
 *         type: "meeting"
 *         total_interactions: 5
 *
 *     OverallMetrics:
 *       type: object
 *       properties:
 *         totalContacts:
 *           type: integer
 *           description: Total number of contacts
 *         totalInteractions:
 *           type: integer
 *           description: Total number of interactions
 *         avgInteractionPerContact:
 *           type: string
 *           description: Average interactions per contact (formatted to 2 decimal places)
 *         totalTags:
 *           type: integer
 *           description: Total number of tags
 *       example:
 *         totalContacts: 150
 *         totalInteractions: 420
 *         avgInteractionPerContact: "2.80"
 *         totalTags: 25
 *
 *     MostInteractedContact:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Contact's unique identifier
 *         firstName:
 *           type: string
 *           description: Contact's first name
 *         lastName:
 *           type: string
 *           description: Contact's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact's email address
 *         phone:
 *           type: string
 *           description: Contact's phone number
 *         company:
 *           type: string
 *           description: Contact's company
 *         jobRole:
 *           type: string
 *           description: Contact's job role
 *         interactionCount:
 *           type: integer
 *           description: Total number of interactions with this contact
 *       example:
 *         id: 1
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         phone: "+1234567890"
 *         company: "Acme Corp"
 *         jobRole: "Software Engineer"
 *         interactionCount: 15
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
 * /api/v1/insights/recently-contacted/{limit}:
 *   get:
 *     summary: Get recently contacted contacts
 *     tags:
 *       - Insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of contacts to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Recently contacted contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RecentContact'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/recently-contacted/:limit', recentlyContacted);

/**
 * @swagger
 * /api/v1/insights/stale-contacts/{days}:
 *   get:
 *     summary: Get contacts that haven't been contacted for a specified number of days
 *     tags:
 *       - Insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 30
 *         description: Number of days to consider a contact as stale
 *         example: 30
 *     responses:
 *       200:
 *         description: Stale contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StaleContact'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/stale-contacts/:days',staleContacts);

/**
 * @swagger
 * /api/v1/insights/contact-summary/{contactId}:
 *   get:
 *     summary: Get interaction summary for a specific contact
 *     tags:
 *       - Insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Contact ID to get summary for
 *         example: 1
 *     responses:
 *       200:
 *         description: Contact summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContactSummary'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact not found
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
router.get('/contact-summary/:contactId',contactSummary);

/**
 * @swagger
 * /api/v1/insights/overall-metrics:
 *   get:
 *     summary: Get overall CRM metrics for the authenticated user
 *     tags:
 *       - Insights
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/OverallMetrics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/overall-metrics',overallMetrics);

/**
 * @swagger
 * /api/v1/insights/most-interacted-contacts:
 *   get:
 *     summary: Get contacts with the most interactions
 *     tags:
 *       - Insights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of contacts to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Most interacted contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MostInteractedContact'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/most-interacted-contacts',mostInteractedContacts);

export default router;

