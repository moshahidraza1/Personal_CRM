import {Router} from "express";
import testRouter from "../controllers/test.controller.js";

const router = Router();

router.get("/", testRouter);

export default router;
