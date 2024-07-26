import express from "express";
import { buyCoin, verifyCoin } from "../controllers/purchaseCoin.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express();

router
  .post("/buy-coin", verifyToken, buyCoin)
  .post("/verify-coin" , verifyCoin);

export default router;
