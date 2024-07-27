import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    from: {
      type: Schema.ObjectId,
      required: true,
    },
    to: {
      type: Schema.ObjectId,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Transaction = model("transaction", transactionSchema);
