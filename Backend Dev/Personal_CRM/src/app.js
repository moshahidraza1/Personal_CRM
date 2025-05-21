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

const app = express();

app.use(cookieParser());
// Rate limiting
const apiLimiter = RateLimitRequestHandler({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after an hour",
});

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

app.use("/user/", apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler); // for handling errors
app.use(morgan('dev')); // Logs requests like "GET /api/health 200 12ms"
app.use(helmet()); // for security
app.use("/api/v1/health", healthRouter);

app.use("/api/v1/test", testRouter);

//user routes
import userRouter from "./routes/user.routes.js";
import contactRouter from "./routes/contact.routes.js";
import interactionRouter from "./routes/interaction.routes.js";
import notesRouter from "./routes/note.routes.js";
import insightsRouter from "./routes/insights.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import stripeRouter from "./routes/stripe.webhook.routes.js";

app.use("/api/v1/user", userRouter);
//Mount OAuth routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/contacts', contactRouter);
app.use('/api/v1/notes', notesRouter);
app.use('/api/v1/interactions', interactionRouter);
app.use('/api/v1/insights', insightsRouter);
app.use('/api/v1/subscription', subscriptionRouter);
app.use('/api/v1/stripe', stripeRouter);

export {app};