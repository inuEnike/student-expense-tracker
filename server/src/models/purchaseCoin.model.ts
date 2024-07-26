import mongoose, { model, Schema } from "mongoose";
import { TPurchaseCoin } from "../types/types";

const purchaseCoinSchema = new Schema<TPurchaseCoin>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending", // set a default value of "pending"
    },
    coinValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const PurchaseCoin = model("purchase", purchaseCoinSchema);
