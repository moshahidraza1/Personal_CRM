import {Router} from "express";
import testRouter from "../controllers/test.controller.js";
import { query, validationResult } from "express-validator";

const router = Router();

router.route("/",
    [query("name").trim().escape() // sanitize input
    ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    }).get(testRouter);

export default router;
