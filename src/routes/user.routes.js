import {Router} from 'express';
import { renewAccessToken,createUser,resendVerificationCode,verifyEmail,loginUser, logOut,updatePassword,forgotPassword,resetPassword, updateUserAccountDetails, userStatus } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { body, query } from 'express-validator';
import validateRequest from '../middlewares/InputValidator.middleware.js';


const emailChain = () => body('email').trim().escape().isEmail().withMessage(' Valid Email is required');

const passwordChain = () => body('password').trim().escape().isLength({min:8}).withMessage('Password should be atleast 8 characters long');

const usernameChain = () => body('username').trim().escape().notEmpty().withMessage('Username is required');
const router = Router();

// user registration
router.post("/register", validateRequest([
    usernameChain(),
    body('firstName').trim().escape().notEmpty().withMessage("firstName should be an string"),
    body('lastName')?.trim().escape().notEmpty().withMessage("lastName should be an string"),
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
        query('email').trim().escape().isEmail().withMessage('Valid Email is required'),
        query('verificationCode').trim().escape().notEmpty().withMessage('Verification code is required'),

    ]),
    verifyEmail
);

// user login
router.post("/login", validateRequest([
    body('email').optional().trim().escape().isEmail().withMessage(' Valid Email is required'),
    body('username').optional().trim().escape().notEmpty().withMessage('Username is required'),
    passwordChain(),
]),loginUser);

// user logOut
router.post("/logOut",verifyJWT, logOut);

//updatePassword
router.patch("/updatePassword", validateRequest([
    body('oldPassword').trim().escape().isLength({min:8}).withMessage('Old password is required'),
    body('newPassword').trim().escape().isLength({min:8}).withMessage('New password is required'),
]),verifyJWT,
updatePassword);

// forgot password
router.post("/forgotPassword", validateRequest([
    emailChain()
]), forgotPassword);

// reset password
router.post("/resetPassword", validateRequest([
    emailChain(),
    body('resetCode').trim().escape().notEmpty().withMessage("Missing password reset code"),
    body('newPassword').trim().escape().isLength({min:8}).withMessage("Minimum 8 characters are required for password")
]), verifyJWT, resetPassword);

// generate access token using refresh token
router.post("/renewToken", renewAccessToken);
//update user details
router.patch("/updateDetails", validateRequest([
    body('firstName').optional().trim().escape().notEmpty().withMessage("firstName should be an string"),
    body('lastName').optional().trim().escape().notEmpty().withMessage("lastName should be an string"),
    //TODO: avatar upload route and logic
]), verifyJWT, updateUserAccountDetails);

// update user's status

router.patch("/status", verifyJWT, userStatus);

export default router;