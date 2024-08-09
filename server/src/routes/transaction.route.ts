import express from "express";
import { send_coin } from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/auth.middleware";

const route = express();

route.post("/send-coin", verifyToken, send_coin);

export default route;
