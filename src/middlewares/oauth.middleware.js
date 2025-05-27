import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {Strategy as GithubStrategy} from 'passport-github2'
import prisma from '../db/db.config.js';
import crypto from 'crypto';
import oauthConfig from '../config/oauth.config.js';
import { generateUsernameFromEmail } from "../utils/helper.utils.js";

// state management for CSRF protection 
const generateOAuthState = ()=>{
    return crypto.randomBytes(32).toString('hex');
} 

const verifyOAuthState = (req, stateFromProvider) => {
    const stored = req.session.oauthState;
    delete req.session.oauthState;
    return stored === stateFromProvider;
};

const handleProfile = async(provider,profile,accessToken,refreshToken,done) => {
    try{
        const email = profile.emails?.[0].value;
        if(!email){
            throw new Error('No email returned from provider');
        }

        let oAuth = await prisma.oAuthAccount.findUnique({
            where:{
                 provider_providerUserId:{
                    provider,
                    providerUserId: profile.id
                 }
            },
            include:{
                user:true
            }
        });

        if(oAuth){
            await prisma.oAuthAccount.update({
                where:{
                    id:oAuth.id
                },
                data:{
                    accessToken,refreshToken,expiresAt:null
                }
            });
            return done(null, oAuth.user);
        }

        let user = await prisma.user.findUnique({
            where:{
                email
            }
        });
        if(user){
            await prisma.oAuthAccount.create({
                data:{
                    provider,
                    providerUserId: profile.id,
                    userId: user.id,
                    accessToken,
                    refreshToken
                }
            });
            return done(null, user);
        }
        let firstName, lastName;
        let full = '';
        if(provider === 'google'){
            firstName = profile.name?.givenName || '';
            lastName = profile.name?.familyName || ''; 
        }else if(provider === 'github'){
             full = profile.displayName || profile._json?.name || '';
        }
        if(full){
            const [first, ...rest] = full.trim().split(' ');
            firstName = first;
            lastName = rest.join(' ');
        }else{
            firstName = profile.username;
            lastName = '';
        }
        const username = await generateUsernameFromEmail(email);
        user = await prisma.user.create({
            data:{
                email,
                username,
                firstName,
                lastName,
                emailVerified: true,
                password: null,
                oauthAccounts: {
                    create:{
                        provider,
                        providerUserId: profile.id,
                        accessToken,
                        refreshToken,
                    }
                }
            }
        });
        return done(null, user);

    }catch(err){
        done(err, null);
    }
};

const initializeOAuth = (app)=>{
    app.use(passport.initialize());
    //Google
    passport.use(new GoogleStrategy(oauthConfig.google,
        (token,refresh, profile,done) => handleProfile('google', profile, token, refresh,done)
    ));
    //GitHub
    passport.use(new GithubStrategy(oauthConfig.github, (token, refresh, profile, done) => handleProfile('github', profile, token, refresh, done)));
}

export{
    generateOAuthState,
    verifyOAuthState,
    handleProfile,
    initializeOAuth
}