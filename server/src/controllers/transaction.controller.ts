import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { USER } from "../models/user.model";

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
    if (!from || !to || !amount) {
      return res.status(400).json({ errormessage: "All fields are required" });
    }

    // Find the sender and recipient users
    const sender = await USER.findById(from).session(session);
    const recipient = await USER.findById(to).session(session);
    const senderPin = await USER.findById(pin).session(session);

    // Check if both users exist
    if (!sender || !recipient) {
      return res
        .status(404)
        .json({ errormessage: "Sender or recipient not found" });
    }
    if (!senderPin) {
      return res.status(404).json({ errormessage: "Please input your pin" });
    }

    // Check if the sender has sufficient coin
    if (sender?.coin < amount) {
      return res.status(400).json({ errormessage: "Insufficient coin" });
    }

    // Deduct the amount from the sender's coin
    sender.coin -= Number(amount);
    await sender.save({ session });

    // Add the amount to the recipient's coin
    recipient.coin += Number(amount);
    await recipient.save({ session });

    // Create a transaction record
    const transaction = new Transaction({
      from: sender._id,
      to: recipient._id,
      amount,
      description,
      date: new Date(),
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
