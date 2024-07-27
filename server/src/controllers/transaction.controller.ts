import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";

const send_coin = async (req: Request, res: Response, next: NextFunction) => {
  const { from, to, amount, description } = req.body;
};
