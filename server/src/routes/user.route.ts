import express from "express";
import {
  getAllUsers,
  getUser,
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
  .get("/get-user", verifyToken, getUser);

export default router;
