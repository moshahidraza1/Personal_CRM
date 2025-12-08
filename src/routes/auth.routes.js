import { Router } from "express";
import passport from 'passport';
import { generateOAuthState, verifyOAuthState } from "../middlewares/oauth.middleware.js";
import {generateAccessAndRefreshToken} from '../controllers/user.controller.js';
import oauthConfig from "../config/oauth.config.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OAuthError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *       example:
 *         error: "OAuth initialization failed"
 */

const setCookies = (res, {accessToken, refreshToken})=>{
    const options = {httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite: 'lax'};
    res.cookie('accessToken', accessToken, {...options, maxAge:15*60*1000});
    res.cookie('refreshToken', refreshToken, options);
};

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags:
 *       - Authentication
 *     description: |
 *       Initiates Google OAuth 2.0 authentication flow by redirecting the user to Google's authorization server.
 *       This endpoint generates a secure state parameter for CSRF protection and redirects to Google's consent screen.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *         headers:
 *           Location:
 *             description: Google OAuth authorization URL with required parameters
 *             schema:
 *               type: string
 *               example: "https://accounts.google.com/oauth/authorize?client_id=...&redirect_uri=...&scope=profile+email&state=..."
 *       500:
 *         description: OAuth initialization failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OAuthError'
 */
router.get('/google', (req,res,next) => {
    
    const state = generateOAuthState();
    req.session.oauthState = state;
    
    passport.authenticate('google', {scope: oauthConfig.google.scope, state, prompt:'select_account'})(req,res,next);
});

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags:
 *       - Authentication
 *     description: |
 *       Processes the OAuth callback from Google after user consent.
 *       Verifies the state parameter, exchanges authorization code for tokens,
 *       creates or updates user account, and sets authentication cookies.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: Error parameter if OAuth failed
 *     responses:
 *       302:
 *         description: Redirects to Dashboard (Success) or Login (Failure)
 *         headers:
 *           Location:
 *             description: Redirect URL to application dashboard
 *             schema:
 *               type: string
 *               example: "/"
 *           Set-Cookie:
 *             description: Authentication cookies containing access and refresh tokens
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/google/callback', (req, res, next) => {
    
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }, (err, user, info) => {
        
        if (err) {
            console.error('[OAuth] Authentication error:', err);
            return res.redirect(`/login?error=oauth_failed`);
        }
        
        if (!user) {
            console.error('[OAuth] No user returned from passport');
            return res.redirect(`/login?error=oauth_failed`);
        }

        // Verify OAuth state for CSRF protection
        const { state } = req.query;
        console.log('State verification:', { provided: state, stored: req.session.oauthState });
        
        if (!verifyOAuthState(req, state)) {
            console.error('[OAuth] State verification failed');
            return res.redirect(`/login?error=oauth_failed`);
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('[OAuth] Login error:', err);
                return res.redirect(`/login?error=oauth_failed`);
            }
            
            console.log('[OAuth] Login successful for user:', user.email);
            // For debugging, redirect to a simple success page
            return res.json({ 
                success: true, 
                user: { id: user.id, email: user.email, firstName: user.firstName }
            });
        });
    })(req, res, next);
});

router.get('/success', (req, res) => {
    if (req.user) {
        res.json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName
            }
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

/**
 * @swagger
 * /api/v1/auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth authentication
 *     tags:
 *       - Authentication
 *     description: |
 *       Initiates GitHub OAuth 2.0 authentication flow by redirecting the user to GitHub's authorization server.
 *       This endpoint generates a secure state parameter for CSRF protection and redirects to GitHub's consent screen.
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth consent screen
 *         headers:
 *           Location:
 *             description: GitHub OAuth authorization URL with required parameters
 *             schema:
 *               type: string
 *               example: "https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=user:email&state=..."
 *       500:
 *         description: OAuth initialization failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OAuthError'
 */
router.get("/github", (req,res,next)=>{
    const state = generateOAuthState();
    req.session.oauthState = state;
    passport.authenticate("github", {scope: oauthConfig.github.scope, state})
    (req,res,next);
});

/**
 * @swagger
 * /api/v1/auth/github/callback:
 *   get:
 *     summary: Handle GitHub OAuth callback
 *     tags:
 *       - Authentication
 *     description: |
 *       Processes the OAuth callback from GitHub after user consent.
 *       Verifies the state parameter, exchanges authorization code for tokens,
 *       creates or updates user account, and sets authentication cookies.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: Error parameter if OAuth failed
 *     responses:
 *       302:
 *         description: Redirects to Dashboard (Success) or Login (Failure)
 *         headers:
 *           Location:
 *             description: Redirect URL to application dashboard
 *             schema:
 *               type: string
 *               example: "/"
 *           Set-Cookie:
 *             description: Authentication cookies containing access and refresh tokens
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get("/github/callback", (req,res,next)=>{
    if(!verifyOAuthState(req, req.query.state)){
        return res.redirect("/login?error=invalid_state");
    }
    passport.authenticate("github", {session: false, failureRedirect: "/login?error=oauth_failed"},
        async (err, user)=>{
            if(err||!user){
                return res.redirect("/login?error=oauth_failed");
            }
            const tokens = await generateAccessAndRefreshToken(user.id);
            setCookies(res,tokens);
            res.redirect("/");
        }

    )(req,res,next);
})

export default router;