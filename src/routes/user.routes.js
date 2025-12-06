import {Router} from 'express';
import { renewAccessToken,createUser,resendVerificationCode,verifyEmail,loginUser, logOut,updatePassword,forgotPassword,resetPassword, updateUserAccountDetails, userStatus } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { body, query } from 'express-validator';
import validateRequest from '../middlewares/InputValidator.middleware.js';


const emailChain = () => body('email').trim().escape().isEmail().withMessage(' Valid Email is required');

const passwordChain = () => body('password').trim().escape().isLength({min:8}).withMessage('Password should be atleast 8 characters long');

const usernameChain = () => body('username').trim().escape().notEmpty().withMessage('Username is required');
const router = Router();

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
// user registration
router.post("/register", validateRequest([
    usernameChain(),
    body('firstName').trim().escape().notEmpty().withMessage("firstName should be an string"),
    body('lastName')?.trim().escape().notEmpty().withMessage("lastName should be an string"),
    emailChain(),
    passwordChain(),
]),
createUser);

/**
 * @swagger
 * /api/v1/user/reVerify-email:
 *   post:
 *     summary: Send request to re verify email
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email is required
 *             requires:
 *               - email
 *     responses:
 *       200:
 *         description: Resend verification mail successfull
 *       400:
 *         description: Email already verified
 *       500:
 *         description: Internal Server Error 
 */

// reVerify email
router.post("/reVerify-email", validateRequest([
    emailChain()
]), resendVerificationCode);

/**
 * @swagger
 * /api/v1/user/verify-email:
 *   get:
 *     summary: Verify Email
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email address
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       404:
 *         description: User not found
 */

// email verification
router.get("/verify-email",
    validateRequest([
        query('email').trim().escape().isEmail().withMessage('Valid Email is required'),
        query('verificationCode').trim().escape().notEmpty().withMessage('Verification code is required'),

    ]),
    verifyEmail
);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login to CRM
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Enter your registered emailId
 *               username:
 *                 type: string
 *                 description: Enter your registere username
 *               password:
 *                 type: string
 *                 description: Enter your password
 *     responses:
 *       200:
 *         description: Login successfull
 *       404:
 *         description: User not found
 *       500: 
 *         description: Internal Server Error
 */

// user login
router.post("/login", validateRequest([
    body('email').optional().trim().escape().isEmail().withMessage(' Valid Email is required'),
    body('username').optional().trim().escape().notEmpty().withMessage('Username is required'),
    passwordChain(),
]),loginUser);

/**
 * @swagger
 * /api/v1/user/logOut:
 *   post:
 *     summary: Log out user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User logged out successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */

// user logOut
router.post("/logOut",verifyJWT, logOut);

/**
 * @swagger
 * /api/v1/user/updatePassword:
 *   patch:
 *     summary: Update user password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Current password (minimum 8 characters)
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid old password or validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
//updatePassword
router.patch("/updatePassword", validateRequest([
    body('oldPassword').trim().escape().isLength({min:8}).withMessage('Old password is required'),
    body('newPassword').trim().escape().isLength({min:8}).withMessage('New password is required'),
]),verifyJWT,
updatePassword);

/**
 * @swagger
 * /api/v1/user/forgotPassword:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user requesting password reset
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *       404:
 *         description: User not found with this email
 *       500:
 *         description: Internal Server Error
 */
// forgot password
router.post("/forgotPassword", validateRequest([
    emailChain()
]), forgotPassword);

/**
 * @swagger
 * /api/v1/user/resetPassword:
 *   post:
 *     summary: Reset password using reset code
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *               resetCode:
 *                 type: string
 *                 description: Password reset code received via email
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *             required:
 *               - email
 *               - resetCode
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset code
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
// reset password
router.post("/resetPassword", validateRequest([
    emailChain(),
    body('resetCode').trim().escape().notEmpty().withMessage("Missing password reset code"),
    body('newPassword').trim().escape().isLength({min:8}).withMessage("Minimum 8 characters are required for password")
]), verifyJWT, resetPassword);

/**
 * @swagger
 * /api/v1/user/renewToken:
 *   post:
 *     summary: Renew access token using refresh token
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Access token renewed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal Server Error
 */
// generate access token using refresh token
router.post("/renewToken", renewAccessToken);

/**
 * @swagger
 * /api/v1/user/updateDetails:
 *   patch:
 *     summary: Update user account details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *             description: At least one field must be provided
 *     responses:
 *       200:
 *         description: User details updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
//update user details
router.patch("/updateDetails", validateRequest([
    body('firstName').optional().trim().escape().notEmpty().withMessage("firstName should be an string"),
    body('lastName').optional().trim().escape().notEmpty().withMessage("lastName should be an string"),
    //TODO: avatar upload route and logic
]), verifyJWT, updateUserAccountDetails);

/**
 * @swagger
 * /api/v1/user/status:
 *   patch:
 *     summary: Toggle user's active status
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User active status toggled successfully
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
// update user's status

router.patch("/status", verifyJWT, userStatus);

export default router;