import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { USER } from "../models/user.model";
import { PurchaseCoin } from "../models/purchaseCoin.model";
import { PurchaseProvision } from "../models/purchaseProvision.model";

const transaction_limit = async (req, res, next) => {
  const fetch_transactions = await Transaction.find();

  console.log(fetch_transactions);
};
transaction_limit();
