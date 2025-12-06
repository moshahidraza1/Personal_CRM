import {Router} from "express";
import {healthRouter} from "../controllers/health.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Current health status of the application
 *           example: "ok"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current server timestamp
 *           example: "2023-12-01T14:30:00.000Z"
 *         uptime:
 *           type: number
 *           description: Server uptime in seconds
 *           example: 86400.5
 *       example:
 *         status: "ok"
 *         timestamp: "2023-12-01T14:30:00.000Z"
 *         uptime: 86400.5
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Check application health status
 *     tags:
 *       - Health
 *     description: Returns the current health status of the application including uptime and timestamp
 *     responses:
 *       200:
 *         description: Application is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       500:
 *         description: Application health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Health check failed"
 */
router.route("/").get(healthRouter)

export default router;