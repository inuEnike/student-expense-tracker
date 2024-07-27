import mongoose from "mongoose";

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

export type TPurchaseProvision = {
  userId: mongoose.Types.ObjectId;
  reference: string;
  item: "Food" | "Provision";
  status: string;
  coinSpent: number;
};

export type TPurchaseCoin = {
  userId: mongoose.Types.ObjectId;
  reference: string;
  amount: number;
  status: string;
  coinValue: number;
};
