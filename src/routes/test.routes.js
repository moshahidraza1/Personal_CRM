import {Router} from "express";
import testRouter from "../controllers/test.controller.js";
import {query} from "express-validator";
import validateRequest from "../middlewares/InputValidator.middleware.js";

const router = Router();

router.get("/",
    validateRequest(
        [
            query("name").
            trim().escape().notEmpty().withMessage("Name is required"),
        ]
    ),  
    testRouter);

export default router;
