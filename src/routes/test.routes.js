import {Router} from "express";
import testRouter from "../controllers/test.controller.js";
import {query} from "express-validator";
import validateRequest from "../middlewares/InputValidator.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Test response message
 *         name:
 *           type: string
 *           description: The name parameter that was provided
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Server timestamp when the request was processed
 *       example:
 *         message: "Test endpoint working successfully"
 *         name: "John"
 *         timestamp: "2023-12-01T14:30:00.000Z"
 *
 *     TestError:
 *       type: object
 *       properties:
 *         error:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               value:
 *                 type: string
 *               msg:
 *                 type: string
 *               path:
 *                 type: string
 *               location:
 *                 type: string
 *           description: Array of validation errors
 *       example:
 *         error:
 *           - type: "field"
 *             value: ""
 *             msg: "Name is required"
 *             path: "name"
 *             location: "query"
 */

/**
 * @swagger
 * /api/v1/test:
 *   get:
 *     summary: Test endpoint for API functionality
 *     tags:
 *       - Testing
 *     description: |
 *       A simple test endpoint to verify API functionality and request validation.
 *       This endpoint requires a name parameter and returns a test response.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Name parameter for testing (cannot be empty)
 *         example: "John"
 *     responses:
 *       200:
 *         description: Test endpoint executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       400:
 *         description: Validation error - name parameter is missing or empty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get("/",
    validateRequest(
        [
            query("name").
            trim().escape().notEmpty().withMessage("Name is required"),
        ]
    ),  
    testRouter);

export default router;
