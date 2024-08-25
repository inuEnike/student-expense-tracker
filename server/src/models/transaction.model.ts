import mongoose, { Schema, model } from "mongoose";
import { Ttrans } from "../types/types";

const transactionSchema = new Schema<Ttrans>(
  {
    from: {
      type: Schema.ObjectId,
      required: true,
      ref: "USER",
    },
    to: {
      type: Schema.ObjectId,
      required: true,
      ref: "USER",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Transaction = model("transaction", transactionSchema);
