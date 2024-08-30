
import mongoose from "mongoose";
import { ENV_DATA } from "./envData";

export const connect = async () => {
  try {
    // edit the options to match taste
    await mongoose.connect(ENV_DATA.DB_URI as string, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection error:", error);
    throw error;
  }
};

export const closeMongo = async () => {
  try {
    await mongoose.connection.close();
    console.log('connection closed successfully');
  } catch (error) {
    console.log('error closing database connection');
    throw error;
  }
}