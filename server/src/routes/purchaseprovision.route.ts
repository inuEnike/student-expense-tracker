import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { purchaseProvision } from "../controllers/purchaseProvision.controller";

const router = express();

router.post("/buy-provision", verifyToken, purchaseProvision);

export default router;
