import {Router} from 'express';
import { createUser,verifyEmail,loginUser } from '../controllers/user.controller.js';

import { body } from 'express-validator';
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

// email verification
router.post("/verify-email",
    validateRequest([
        emailChain(),
        body('verificationCode').notEmpty().withMessage('Verification code is required')
    ]),
    verifyEmail
);

// user login
router.post("/login", validateRequest([
    body('email').optional().isEmail().withMessage(' Valid Email is required'),
    body('username').optional().notEmpty().withMessage('Username is required'),
    passwordChain(),
]),loginUser);

export default router;