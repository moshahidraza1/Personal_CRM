import express, {Router} from "express";
import { handleStripeWebhook } from "../controllers/stripe.webhook.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     StripeWebhookEvent:
 *       type: object
 *       description: Stripe webhook event object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the event
 *         object:
 *           type: string
 *           enum: [event]
 *           description: String representing the object's type
 *         api_version:
 *           type: string
 *           description: The Stripe API version used to render data
 *         created:
 *           type: integer
 *           description: Time at which the object was created (Unix timestamp)
 *         data:
 *           type: object
 *           description: Object containing data associated with the event
 *         livemode:
 *           type: boolean
 *           description: Whether the event was created in live mode or test mode
 *         pending_webhooks:
 *           type: integer
 *           description: Number of webhooks yet to be successfully delivered
 *         request:
 *           type: object
 *           nullable: true
 *           description: Information on the API request that instigated the event
 *         type:
 *           type: string
 *           description: Description of the event
 *           enum:
 *             - customer.subscription.created
 *             - customer.subscription.updated
 *             - customer.subscription.deleted
 *             - invoice.payment_succeeded
 *             - invoice.payment_failed
 *       example:
 *         id: "evt_1234567890"
 *         object: "event"
 *         api_version: "2023-10-16"
 *         created: 1640995200
 *         type: "customer.subscription.updated"
 *         livemode: false
 *         pending_webhooks: 1
 *         data:
 *           object:
 *             id: "sub_1234567890"
 *             object: "subscription"
 *             status: "active"
 *             current_period_start: 1640995200
 *             current_period_end: 1643673600
 *
 *     WebhookResponse:
 *       type: object
 *       properties:
 *         received:
 *           type: boolean
 *           description: Indicates whether the webhook was successfully processed
 *       example:
 *         received: true
 *
 *     WebhookError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *       example:
 *         error: "Webhooks Processing Failed"
 */

/**
 * @swagger
 * /api/v1/stripe/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags:
 *       - Webhooks
 *     description: |
 *       Handles webhook events from Stripe for subscription management.
 *       This endpoint processes subscription lifecycle events including:
 *       - customer.subscription.created
 *       - customer.subscription.updated  
 *       - customer.subscription.deleted
 *       
 *       The webhook signature is verified using Stripe's webhook secret to ensure authenticity.
 *       Successful processing updates user subscription status and role in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StripeWebhookEvent'
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for event verification
 *         example: "t=1640995200,v1=abcdef1234567890,v0=fedcba0987654321"
 *     responses:
 *       200:
 *         description: Webhook event processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookResponse'
 *       400:
 *         description: Webhook signature verification failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Webhook Error: Invalid signature"
 *       500:
 *         description: Internal server error during webhook processing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookError'
 *     security: []
 *     x-webhook-events:
 *       - customer.subscription.created
 *       - customer.subscription.updated
 *       - customer.subscription.deleted
 */
router.post('/webhook', express.raw({type: "application/json"}), handleStripeWebhook);


export default router; 
