import express from "express";
import {
  getAllTransactions,
  send_coin,
} from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/auth.middleware";

const route = express();

route
  .post("/send-coin", verifyToken, send_coin)
  .get("/transactions", getAllTransactions);

export default route;
