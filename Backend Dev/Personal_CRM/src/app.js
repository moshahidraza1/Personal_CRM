import express from "express";
import healthRouter from "./routes/health.routes.js";
import testRouter from "./routes/test.routes.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// app.get("/health",(req,res)=>{
//     res.json({status:"ok",timestamp: new Date()});
// });
app.use(errorHandler); // for handling errors
app.use(morgan('dev')); // Logs requests like "GET /api/health 200 12ms"
app.use(helmet()); // for security
app.use("/api/v1/health", healthRouter);

app.use("/api/v1/test", testRouter);


export {app};