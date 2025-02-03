import {Router} from "express";
import {healthRouter} from "../controllers/health.controller.js";

const router = Router();

router.route("/").get(healthRouter)

export default router;