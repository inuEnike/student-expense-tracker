import mongoose from "mongoose";
import { ENV_DATA } from "./envData";

const connect = async () => {
  try {
    await mongoose.connect(ENV_DATA.DB_URI as string);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

export default connect;
