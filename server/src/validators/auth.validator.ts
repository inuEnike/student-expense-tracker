import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { USER } from "../models/user.model";

export const signupValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstname, email, password, repeatPassword, matno, surname } =
    req.body;

  // Regular expressions for validation
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const uppercaseRegex = /[A-Z]/;

  // Validation
  if (
    !firstname ||
    !surname ||
    !email ||
    !password ||
    !matno ||
    !repeatPassword
  ) {
    return res.status(400).json({ errMessage: "All fields are required" });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ errMessage: "Passwords must match" });
  }

  if (!matno.startsWith("ESH")) {
    return res
      .status(400)
      .json({ errMessage: "Matriculation number must start with 'ESH'" });
  }

  if (!specialCharRegex.test(password)) {
    return res.status(400).json({
      errMessage: "Password must contain at least one special character",
    });
  }

  if (!uppercaseRegex.test(password)) {
    return res
      .status(400)
      .json({ errMessage: "Password must contain an uppercase character" });
  }

  try {
    const user = await USER.findOne({ matno });
    if (user) {
      return res.status(400).json({ errMessage: "User already exists" });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const signinValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, matno } = req.body;

  // Regular expressions for validation
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const uppercaseRegex = /[A-Z]/;

  // Validation
  if (!password || !matno) {
    return res.status(400).json({ errMessage: "All fields are required" });
  }

  if (!matno.startsWith("ESH")) {
    return res
      .status(400)
      .json({ errMessage: "Matriculation number must start with 'ESH'" });
  }

  try {
    const user = await USER.findOne({ matno });
    if (!user) {
      return res.status(404).json({ errMessage: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ errMessage: "Invalid credentials" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
