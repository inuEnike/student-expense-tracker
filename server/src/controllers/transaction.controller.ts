import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { USER } from "../models/user.model";
import { PurchaseCoin } from "../models/purchaseCoin.model";
import { PurchaseProvision } from "../models/purchaseProvision.model";

const transaction_limit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const fetch_transactions = await Transaction.find();
  console.log(fetch_transactions);
};

export const send_coin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction session

  try {
    let { from, matno, amount, description, pin } = req.body;
    const MAX_TRANSACTION_AMOUNT = 5000; // Single transaction limit
    const DAILY_TRANSACTION_LIMIT = 20000; // Daily transaction limit

    // Convert amount to a number
    amount = Number(amount);

    // Check if all required fields are present
    if (!from || !matno || !amount || !pin) {
      return res.status(400).json({ errormessage: "All fields are required" });
    }

    // Find the sender by their ID
    const sender = await USER.findById(from).session(session);
    if (!sender) {
      return res.status(404).json({ errormessage: "Sender not found" });
    }

    // Find the recipient using their matno
    const recipient = await USER.findOne({ matno }).session(session);
    if (!recipient) {
      return res
        .status(404)
        .json({ errormessage: "Recipient with the provided matno not found" });
    }

    // Validate the pin
    if (sender.pin !== pin) {
      return res.status(400).json({ errormessage: "Invalid pin" });
    }

    // Check if the amount exceeds the maximum transaction limit
    if (amount > MAX_TRANSACTION_AMOUNT) {
      return res.status(400).json({
        errormessage: `Transaction limit exceeded. Maximum allowed is ${MAX_TRANSACTION_AMOUNT} coins.`,
      });
    }

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch total transactions for the sender on the current day
    const totalSentToday = await Transaction.aggregate([
      {
        $match: {
          from: sender._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: { _id: null, totalAmount: { $sum: { $toDouble: "$amount" } } },
      },
    ]);

    const totalAmountSent =
      totalSentToday.length > 0 ? totalSentToday[0].totalAmount : 0;

    console.log(
      `Total sent today: ${totalAmountSent}, New amount: ${amount}, Daily Limit: ${DAILY_TRANSACTION_LIMIT}`
    );

    if (totalAmountSent + amount > DAILY_TRANSACTION_LIMIT) {
      return res.status(400).json({
        errormessage: `Daily transaction limit exceeded. Maximum allowed per day is ${DAILY_TRANSACTION_LIMIT} coins.`,
      });
    }

    // Check if the sender has sufficient coin
    if (sender.coin < amount) {
      return res.status(400).json({ errormessage: "Insufficient coin" });
    }

    // Deduct the amount from the sender's coin
    sender.coin -= amount;
    await sender.save({ session });

    // Add the amount to the recipient's coin
    recipient.coin += amount;
    await recipient.save({ session });

    // Create transaction records
    const senderTransaction = new Transaction({
      from: sender._id,
      to: recipient._id,
      amount,
      description,
      type: "Debit", // Sender's transaction type
    });

    const recipientTransaction = new Transaction({
      from: sender._id,
      to: recipient._id,
      amount,
      description,
      type: "Credit", // Recipient's transaction type
    });

    // Save both transactions
    await senderTransaction.save({ session });
    await recipientTransaction.save({ session });

    // Commit the transaction if everything is successful
    await session.commitTransaction();
    session.endSession();

    // Respond with the sender's transaction record
    return res.status(200).json({
      message: "Transaction successful",
      senderTransaction, // Return sender's transaction record
      recipientTransaction, // Return recipient's transaction record
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction Error:", error);
    return res.status(500).json({ errormessage: "Transaction failed" });
  }
};

export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sendCoinTransaction = await Transaction.find({});
  const purchaseCoinTransaction = await PurchaseCoin.find({});
  // const purchaseProvisionTransaction = await PurchaseProvision.find({});
  const getAllData = [
    ...sendCoinTransaction,
    ...purchaseCoinTransaction,
    // ...purchaseProvisionTransaction,
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
    // Fetching transactions where the user is the sender (Debit)
    const sendCoinTransaction = await Transaction.find({
      from: user?.id,
      type: "Debit", // Only debit transactions for senders
    }).populate(["from", "to"]);

    // Fetching transactions where the user is the recipient (Credit)
    const receiveCoinTransaction = await Transaction.find({
      to: user?.id,
      type: "Credit", // Only credit transactions for receivers
    }).populate(["from", "to"]);

    // Fetching purchase transactions related to the user
    const purchaseCoinTransaction = await PurchaseCoin.find({
      userId: user?.id,
    }).populate("userId");

    // Combining all transactions
    const getAllData = [
      ...sendCoinTransaction, // Debit transactions (sender side)
      ...receiveCoinTransaction, // Credit transactions (recipient side)
      ...purchaseCoinTransaction, // Purchase coin transactions
    ];

    // Sort transactions by creation date (descending)
    getAllData.sort(
      (a, b) =>
        new Date((b as any).createdAt).getTime() -
        new Date((a as any).createdAt).getTime()
    );

    // Get the most recent 6 transactions

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
    // Fetching transactions where the user is the sender (Debit)
    const sendCoinTransaction = await Transaction.find({
      from: user?.id,
      type: "Debit", // Only debit transactions for senders
    }).populate(["from", "to"]);

    // Fetching transactions where the user is the recipient (Credit)
    const receiveCoinTransaction = await Transaction.find({
      to: user?.id,
      type: "Credit", // Only credit transactions for receivers
    }).populate(["from", "to"]);

    // Fetching purchase transactions related to the user
    const purchaseCoinTransaction = await PurchaseCoin.find({
      userId: user?.id,
    }).populate("userId");

    // Combining all transactions
    const getAllData = [
      ...sendCoinTransaction, // Debit transactions (sender side)
      ...receiveCoinTransaction, // Credit transactions (recipient side)
      ...purchaseCoinTransaction, // Purchase coin transactions
    ];

    // Sort transactions by creation date (descending)
    getAllData.sort(
      (a, b) =>
        new Date((b as any).createdAt).getTime() -
        new Date((a as any).createdAt).getTime()
    );

    // Get the most recent 6 transactions
    const recentTransactions = getAllData.slice(0, 6);

    return res.status(200).json({ data: recentTransactions });
  } catch (error) {
    next(error);
  }
};
