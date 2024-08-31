import mongoose, { model, Schema } from "mongoose";
import { TPurchaseProvision } from "../types/types";

const purchaseProvisionSchema = new Schema<TPurchaseProvision>(
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
    item: {
      type: String,
      enum: {
        values: ["Food", "Provision"],
        message: "{VALUE} is not supported",
      },
      default: "Food",
    },
    status: {
      type: String,
      required: true,
      default: "pending", // set a default value of "pending"
    },
    coinSpent: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: "Debit", // default type for this model
    },
  },
  { timestamps: true }
);

export const PurchaseProvision = model(
  "purchaseProvision",
  purchaseProvisionSchema
);
