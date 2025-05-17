import { Router } from "express";
import passport from 'passport';
import { generateOAuthState, verifyOAuthState } from "../middlewares/oauth.middleware.js";
import {generateAccessAndRefreshToken} from '../controllers/user.controller.js';
import oauthConfig from "../config/oauth.config.js";

const router = Router();

const setCookies = (res, {accessToken, refreshToken})=>{
    const options = {httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite: 'lax'};
    res.cookie('accessToken', accessToken, {...options, maxAge:15*60*1000});
    res.cookie('refreshToken', refreshToken, options);
};

router.get('/google', (req,res,next) => {
    const state = generateOAuthState();
    req.session.oauthState = state;
    passport.authenticate('google', {scope: oauthConfig.google.scope, state, prompt:'select_account'})(req,res,next);
});

router.get('/google/callback', (req,res,next) => {
    if(!verifyOAuthState(req,req.query.state)){
        return res.redirect('/login?error=invalid_state');
    }
    passport.authenticate('google', {session:false, failureRedirect:'/login?error=oauth_failed'},
        async(err, user) => {
            if(err || !user) return res.redirect('/login?error=oauth_failed');

            const tokens = await generateAccessAndRefreshToken(user.id);
            setCookies(res, tokens);

            return res.redirect('/')

        }
    )(req,res,next);
});

router.get("/github", (req,res,next)=>{
    const state = generateOAuthState();
    req.session.oauthState = state;
    passport.authenticate("github", {scope: oauthConfig.github.scope, state})
    (req,res,next);
});

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