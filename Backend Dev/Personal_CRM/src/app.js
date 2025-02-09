import express from "express";
import healthRouter from "./routes/health.routes.js";
import testRouter from "./routes/test.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import helmet from "helmet";
import morgan from "morgan";
import RateLimitRequestHandler from "express-rate-limit";

const app = express();

// Rate limiting
const apiLimiter = RateLimitRequestHandler({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after an hour",
});
app.use("/user/", apiLimiter);
app.use(express.json());

app.use(errorHandler); // for handling errors
app.use(morgan('dev')); // Logs requests like "GET /api/health 200 12ms"
app.use(helmet()); // for security
app.use("/api/v1/health", healthRouter);

app.use("/api/v1/test", testRouter);

//user routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/user", userRouter);


export {app};