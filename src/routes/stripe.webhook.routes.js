import express, {Router} from "express";
import { handleStripeWebhook } from "../controllers/stripe.webhook.controller.js";

const router = express.Router();

router.post('/webhook', express.raw({type: "application/json"}), handleStripeWebhook);


export default router;
