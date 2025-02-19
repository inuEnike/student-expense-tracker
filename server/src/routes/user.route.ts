import express from "express";
import {
  getAllUsers,
  getUser,
  setPin,
  signin,
  Signup,
} from "../controllers/user.controller";
import { signinValidator, signupValidator } from "../validators/auth.validator";
import { verifyToken } from "../middleware/auth.middleware";

const router = express();

router
  .get("/all-users", verifyToken, getAllUsers)
  .post("/signup", signupValidator, Signup)
  .post("/signin", signinValidator, signin)
  .post("/set-pin", verifyToken, setPin)
  .get("/get-user", verifyToken, getUser);

export default router;
