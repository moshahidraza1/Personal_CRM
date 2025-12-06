import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createCheckoutSession } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutSession:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: Stripe checkout session URL for payment
 *         sessionId:
 *           type: string
 *           description: Stripe checkout session ID
 *       example:
 *         url: "https://checkout.stripe.com/pay/cs_test_..."
 *         sessionId: "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *
 *     SubscriptionError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Failed to create checkout session"
 */

/**
 * @swagger
 * /api/v1/subscription/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Creates a Stripe checkout session for subscribing to premium features.
 *       Returns a checkout URL that the user can be redirected to for payment processing.
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutSession'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized request"
 *       400:
 *         description: Bad request - User already has active subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionError'
 *       500:
 *         description: Internal server error - Failed to create checkout session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionError'
 */
router.post('/create-checkout-session', createCheckoutSession);

export default router;