import {
    recentlyContacted,
    staleContacts,
    contactSummary,
    overallMetrics,
    mostInteractedContacts
} from "../controllers/insights.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();
router.use(verifyJWT);

router.get('/recently-contacted/:limit', recentlyContacted);

router.get('/stale-contacts/:days',staleContacts);

router.get('/contact-summary/:contactId',contactSummary);

router.get('/overall-metrics',overallMetrics);

router.get('/most-interacted-contacts',mostInteractedContacts);

export default router;