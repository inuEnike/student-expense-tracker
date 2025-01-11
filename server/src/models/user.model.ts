import mongoose, { Schema, model } from "mongoose";
import { TUser } from "../types/types";

const USERMODEL = new Schema<TUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },
    matno: {
      type: String,
      required: true,
    },
    coin: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    repeatPassword: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    pin: {
      type: Number,
    },
  },
  { timestamps: true }
);
USERMODEL.pre("save", function (next) {
  if (this.coin) {
    this.coin = Math.round(this.coin);
  }
  next();
});

export const USER = model("user", USERMODEL);
