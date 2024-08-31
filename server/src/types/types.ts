import mongoose from "mongoose";

// User Type
export type TUser = {
  firstname: string;
  lastname: string;
  surname: string;
  email: string;
  matno: string;
  image: string;
  coin: number;
  password: string;
  repeatPassword: string;
  pin: number;
};

// Purchase Provision Type
export type TPurchaseProvision = {
  userId: mongoose.Types.ObjectId;
  reference: string;
  item: "Food" | "Provision";
  status: string;
  coinSpent: number;
  type?: "provision"; // optional field with default value
};

// Purchase Coin Type
export type TPurchaseCoin = {
  userId: mongoose.Types.ObjectId;
  reference: string;
  amount: number;
  status: string;
  coinValue: number;
  type?: "purchase"; // optional field with default value
};

// Transaction Type
export type Ttrans = {
  from: mongoose.Schema.Types.ObjectId;
  to: mongoose.Schema.Types.ObjectId;
  amount: number;
  description?: string; // optional field
  createdAt?: Date;
  updatedAt?: Date;
  type?: "send" | "receive"; // optional field with default values
};
