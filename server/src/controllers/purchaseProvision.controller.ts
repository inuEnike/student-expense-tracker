import { PurchaseProvision } from "../models/purchaseProvision.model";
import { NextFunction, Request, Response } from "express";
import { USER } from "../models/user.model";
import mongoose from "mongoose";

export const purchaseProvision = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, status, coinSpent, reference, item } = req.body;

  try {
    if (!userId || !coinSpent) {
      return res
        .status(400)
        .json({ errormessage: "Please Fill in the fields" });
    }

    const user = await USER.findById(userId);

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }
    if (coinSpent > user.coin) {
      return res.status(400).json({ errorMessage: "No Enough Coin " });
    }

    user.coin -= coinSpent;

    await user.save();
    // Create a purchase provision record
    const purchase = new PurchaseProvision({
      userId: user._id,
      status: status || "pending",
      coinSpent,
      reference: reference || new mongoose.Types.ObjectId().toString(), // generate a unique reference if not provided
      item,
    });

    await purchase.save();

    // Respond to the request
    res
      .status(201)
      .json({ message: "Purchase provision created successfully", purchase });
  } catch (error) {
    next(error);
  }
};
