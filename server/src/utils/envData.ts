import dotenv from "dotenv";
dotenv.config();

export const ENV_DATA = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.DB_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  PAYSTACK_KEY: process.env.PAYSTACK_SECRET_KEY,
  NGROK_API_KEY: process.env.NGROK_API_KEY,
};
