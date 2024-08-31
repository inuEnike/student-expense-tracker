import { NextFunction, Request, Response } from "express";
import { PurchaseCoin } from "./../models/purchaseCoin.model";
import mongoose from "mongoose";
import Paystack from "../utils/paystack";
import { USER } from "../models/user.model";

export const buyCoin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, amount, type } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction session

  if (!userId || !amount) {
    return res.status(404).json({ errorMessage: "Fill in the fields" });
  }

  try {
    const user = await USER.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ errormessage: "No user found" });
    }

    const coins = amount / 15;
    const reference = new mongoose.Types.ObjectId().toString(); // or generate a unique reference

    const purchase = new PurchaseCoin({
      userId: user._id,
      amount,
      coinValue: coins,
      reference,
      type,
      status: "pending", // set initial status to "pending"
    });

    await purchase.save({ session });

    const response = await Paystack.transaction.initialize({
      email: user.email,
      amount: amount * 100,
      reference: purchase.reference,
      name: `${user.firstname} ${user.lastname}`,
    });

    // You can update the purchase status to "initialized" or any other status if you like
    purchase.status = "initialized";

    await purchase.save({ session });

    // Commit the transaction if everything is successful
    await session.commitTransaction();
    session.endSession();
    return res
      .status(201)
      .json({ message: "Transaction initialized", response });
  } catch (error) {
    next(error);
  }
};

//Auto verify the transaction with paystack webhook
export const verifyCoin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data = req.body;

  console.log("Webhook data received:", JSON.stringify(data, null, 2));

  if (data.event === "charge.success") {
    const { reference, type } = data.data;

    try {
      // Find the purchase record by reference
      const purchase = await PurchaseCoin.findOne({ reference });
      if (!purchase) {
        return res
          .status(404)
          .json({ errorMessage: "Purchase record not found" });
      }

      // Check if the transaction is already completed
      if (purchase.status === "completed") {
        return res
          .status(400)
          .json({ errorMessage: "Transaction already processed" });
      }

      // Verify the transaction with Paystack
      const verify = await Paystack.transaction.verify(reference);
      const { data: verificationData } = verify;

      if (verificationData.status !== "success") {
        return res
          .status(400)
          .json({ errorMessage: "Transaction verification failed" });
      }

      // Update purchase status
      purchase.status = "completed";
      await purchase.save();

      // Update user's coin balance
      const user = await USER.findById(purchase.userId);
      if (!user) {
        return res.status(404).json({ errorMessage: "User not found" });
      }

      user.coin += purchase.coinValue;
      purchase.type = "Credit";

      await user.save();

      return res.status(200).json({
        message: "Payment verified and coins added to user's balance",
        user,
      });
    } catch (error) {
      next(error);
    }
  } else {
    return res.status(400).json({ errorMessage: "Event type not handled" });
  }
};
