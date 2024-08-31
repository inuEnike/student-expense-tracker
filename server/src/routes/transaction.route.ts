import express from "express";
import {
  getAllTransactions,
  getRecentUserTransactions,
  getUserTransactions,
  send_coin,
} from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/auth.middleware";

const route = express();

route
  .post("/send-coin", verifyToken, send_coin)
  .get("/transactions", getAllTransactions)
  .get("/transaction", verifyToken, getUserTransactions)
  .get("/recent-transactions", verifyToken, getRecentUserTransactions);

export default route;
