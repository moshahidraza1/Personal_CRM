import {Router} from 'express';
import { renewAccessToken,createUser,resendVerificationCode,verifyEmail,loginUser, logOut,updatePassword,forgotPassword,resetPassword } from '../controllers/user.controller.js';

import { body, query } from 'express-validator';
import validateRequest from '../middlewares/InputValidator.middleware.js';


const emailChain = () => body('email').isEmail().withMessage(' Valid Email is required');

const passwordChain = () => body('password').isLength({min:8}).withMessage('Password should be atleast 8 characters long');

const usernameChain = () => body('username').notEmpty().withMessage('Username is required');
const router = Router();

// user registration
router.post("/register", validateRequest([
    usernameChain(),
    emailChain(),
    passwordChain(),
]),
createUser);

// reVerify email
router.post("/reVerify-email", validateRequest([
    emailChain()
]), resendVerificationCode);

// email verification
router.get("/verify-email",
    validateRequest([
        query('email').isEmail().withMessage('Valid Email is required'),
        query('verificationCode').notEmpty().withMessage('Verification code is required'),

    ]),
    verifyEmail
);

// user login
router.post("/login", validateRequest([
    body('email').optional().isEmail().withMessage(' Valid Email is required'),
    body('username').optional().notEmpty().withMessage('Username is required'),
    passwordChain(),
]),loginUser);

// user logOut
router.post("/logOut", logOut);

//updatePassword
router.post("/updatePassword", validateRequest([
    body('oldPassword').isLength({min:8}).withMessage('Old password is required'),
    body('newPassword').isLength({min:8}).withMessage('New password is required'),
]),
updatePassword);

// forgot password
router.post("/forgotPassword", validateRequest([
    emailChain
]), forgotPassword);

// reset password
router.post("/resetPassword", validateRequest([
    emailChain,
    body('resetCode').notEmpty().withMessage("Missing password reset code"),
    body('newPassword').isLength({min:8}).withMessage("Minimum 8 characters are required for password")
]), resetPassword);

// generate access token using refresh token
router.post("/renewToken", renewAccessToken);

export default router;