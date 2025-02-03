import {Router} from "express";
import testRouter from "../controllers/test.controller.js";

const router = Router();

router.route("/").get(testRouter);

export default router;
