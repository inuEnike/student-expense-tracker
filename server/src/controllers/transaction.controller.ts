import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { USER } from "../models/user.model";
import { PurchaseCoin } from "../models/purchaseCoin.model";
import { PurchaseProvision } from "../models/purchaseProvision.model";

export const send_coin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction session

  try {
    const { from, to, amount, description, pin } = req.body;

    // Check if all required fields are present
    if (!from || !to || !amount || !pin) {
      return res.status(400).json({ errormessage: "All fields are required" });
    }

    // Find the sender and recipient users
    const sender = await USER.findById(from).session(session);
    const recipient = await USER.findById(to).session(session);
    const userWithPin = await USER.findById(from).session(session); // Find user by pin

    // Check if both users exist
    if (!sender || !recipient) {
      return res
        .status(404)
        .json({ errormessage: "Sender or recipient not found" });
    }

    if (!userWithPin || userWithPin.pin !== pin) {
      return res.status(400).json({ errormessage: "Invalid pin" });
    }

    // Check if the sender has sufficient coin
    if (sender.coin < amount) {
      return res.status(400).json({ errormessage: "Insufficient coin" });
    }

    // Deduct the amount from the sender's coin
    sender.coin -= Number(amount);
    await sender.save({ session });

    // Add the amount to the recipient's coin
    recipient.coin += Number(amount);
    await recipient.save({ session });

    // Determine the type based on the role
    const transactionType = sender._id.equals(from) ? "Debit" : "Credit";

    // Create a transaction record
    const transaction = new Transaction({
      from: sender._id,
      to: recipient._id,
      amount,
      description,
      date: new Date(),
      type: transactionType, // Set the type based on the condition
    });

    await transaction.save({ session });

    // Commit the transaction if everything is successful
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Transaction successful",
      transaction,
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    console.error("Error during transaction:", error);
    return res.status(500).json({ errormessage: "Internal server error" });
  }
};

export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sendCoinTransaction = await Transaction.find({});
  const purchaseCoinTransaction = await PurchaseCoin.find({});
  const purchaseProvisionTransaction = await PurchaseProvision.find({});
  const getAllData = [
    ...sendCoinTransaction,
    ...purchaseCoinTransaction,
    ...purchaseProvisionTransaction,
  ];
  return res.status(200).json({ data: getAllData });
};

export const getUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req.user;

  try {
    // Fetching transactions
    const sendCoinTransactionFrom = await Transaction.find({ from: user?.id });
    const sendCoinTransactionTo = await Transaction.find({ to: user?.id });
    const purchaseCoinTransaction = await PurchaseCoin.find({
      userId: user?.id,
    });
    const purchaseProvisionTransaction = await PurchaseProvision.find({
      userId: user?.id,
    });

    // Filtering only completed or failed purchaseCoinTransaction
    const filteredPurchaseCoinTransaction = purchaseCoinTransaction.filter(
      (transaction) =>
        transaction.status === "completed" || transaction.status === "failed"
    );

    // Combining all transactions
    const getAllData = [
      ...sendCoinTransactionTo,
      ...sendCoinTransactionFrom,
      ...filteredPurchaseCoinTransaction, // Only completed or failed purchase coin transactions
      ...purchaseProvisionTransaction,
    ];

    // Returning response
    return res.status(200).json({ data: getAllData });
  } catch (error) {
    console.error("Error fetching user transactions", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching transactions." });
  }
};

export const getRecentUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req.user;

  try {
    // Fetching transactions
    const sendCoinTransactionFrom = await Transaction.find({ from: user?.id });
    const sendCoinTransactionTo = await Transaction.find({ to: user?.id });
    const purchaseCoinTransaction = await PurchaseCoin.find({
      userId: user?.id,
    });
    const purchaseProvisionTransaction = await PurchaseProvision.find({
      userId: user?.id,
    });

    // Filter only completed or failed purchaseCoinTransaction
    const filteredPurchaseCoinTransaction = purchaseCoinTransaction.filter(
      (transaction) =>
        transaction.status === "completed" || transaction.status === "failed"
    );

    // Combine all transactions
    let getAllData = [
      ...sendCoinTransactionTo,
      ...sendCoinTransactionFrom,
      ...filteredPurchaseCoinTransaction,
      ...purchaseProvisionTransaction,
    ];

    // Type assertion to add createdAt and updatedAt fields
    getAllData = getAllData.sort(
      (a, b) =>
        new Date((b as any).createdAt).getTime() -
        new Date((a as any).createdAt).getTime()
    );

    // Get the most recent 5 transactions
    const recentTransactions = getAllData.slice(0, 5);

    // Returning response
    return res.status(200).json({ data: recentTransactions });
  } catch (error) {
    console.error("Error fetching recent transactions", error);
    return res.status(500).json({
      message: "An error occurred while fetching recent transactions.",
    });
  }
};
