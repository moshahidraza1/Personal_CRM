import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createCheckoutSession } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.post('/create-checkout-session', createCheckoutSession);

export default router;