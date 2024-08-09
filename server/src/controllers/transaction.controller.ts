import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";

export const send_coin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { from, to, amount, description } = req.body;
  if (!from || !to || !amount) {
    return res
      .status(404)
      .json({ errormessage: "Please the fields are required" });
  }

  const user = ;
  console.log(user);
};
