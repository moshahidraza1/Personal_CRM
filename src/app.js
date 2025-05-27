import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { initializeOAuth } from "./middlewares/oauth.middleware.js";
import healthRouter from "./routes/health.routes.js";
import testRouter from "./routes/test.routes.js";
import authRouter from './routes/auth.routes.js';
import errorHandler from "./middlewares/errorHandler.middleware.js";
import helmet from "helmet";
import morgan from "morgan";
import RateLimitRequestHandler from "express-rate-limit";
import cors from "cors";
import {redisClient,slidingWindowRateLimiter} from "./middlewares/redisRateLimiter.middleware.js";
import prisma from "./db/db.config.js";
const app = express();

const corsOptions = {
    origin:  `${process.env.FRONTEND_URL}`,
    methods: 'GET,POST, PATCH, DELETE' ,
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions));
app.use(cookieParser());

await redisClient.connect();
redisClient.on('error', (err)=>{
    console.error('Redis connection error: ', err);
})


// Rate limiting
const apiLimiter = slidingWindowRateLimiter({
    windowMs:15*60*1000, 
    max : 100,
    keyPrefix : 'rl:'});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10*60*1000
    }
}));

// Wire up passport strategies
initializeOAuth(app);

// app.use("/user/", apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler); // for handling errors
app.use(morgan('dev')); // Logs requests like "GET /api/health 200 12ms"
app.use(helmet()); // for security
app.use("/api/v1/health", apiLimiter, healthRouter);

// check DB connection
app.get('/api/v1/ready',
   async(req,res)=>{
    try {
     await prisma.$queryRaw `SELECT 1`;
    res.status(200).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString()
    });

   } catch (error) {
        console.error(error);
        res.status(503).json({
            status: 'not ready',
            database: 'disconnected',
            timestamp: new Date().toISOString
        });
   }}
);

app.use("/api/v1/test", testRouter);

//user routes
import userRouter from "./routes/user.routes.js";
import contactRouter from "./routes/contact.routes.js";
import interactionRouter from "./routes/interaction.routes.js";
import notesRouter from "./routes/note.routes.js";
import insightsRouter from "./routes/insights.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import stripeRouter from "./routes/stripe.webhook.routes.js";

app.use("/api/v1/user", apiLimiter, userRouter);
//Mount OAuth routes
app.use('/api/v1/auth', apiLimiter, authRouter);
app.use('/api/v1/contacts', apiLimiter,contactRouter);
app.use('/api/v1/notes', apiLimiter,   notesRouter);
app.use('/api/v1/interactions', apiLimiter, interactionRouter);
app.use('/api/v1/insights',  apiLimiter, insightsRouter);
app.use('/api/v1/subscription', apiLimiter, subscriptionRouter);
app.use('/api/v1/stripe', apiLimiter, stripeRouter);

export {app};