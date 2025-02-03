import express from "express";
import healthRouter from "./routes/health.routes.js";
import testRouter from "./routes/test.routes.js";
const app = express();

// app.get("/health",(req,res)=>{
//     res.json({status:"ok",timestamp: new Date()});
// });

app.use("/api/v1/health", healthRouter);

app.use("/api/v1/test", testRouter);


export {app};