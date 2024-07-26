import { NextFunction, Request, Response } from "express";
import { USER } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ENV_DATA } from "../utils/envData";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await USER.find();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

export const Signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstname, lastname, email, password, matno, coin, surname, image } =
    req.body;
  try {
    const ProfileImage = ["/image1.png", "/image2.png", "/image3.png"];
    const shuffledImage = Math.floor(Math.random() * ProfileImage.length);
    const selectedImage = ProfileImage[shuffledImage];
    const hashpassword = await bcrypt.hash(password, 10);
    const users = await USER.create({
      firstname,
      lastname,
      email,
      password: hashpassword,
      matno,
      coin,
      image: selectedImage,
      surname,
    });
    res.status(201).json({ users });
  } catch (error) {
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { matno } = req.body;
  const user = await USER.findOne({ matno });
  const data = { matno: user?.matno, email: user?.email };
  return res.status(200).json({
    data,
    token: handleToken(data),
  });
};
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data = req.user.user;
  const user = await USER.findOne({ matno: data.matno }).select("-password");
  return res.status(200).json(user);
};

const handleToken = (user: any) => {
  let token = jwt.sign({ user }, ENV_DATA.JWT_SECRET as string, {
    expiresIn: 5 * 24 * 60 * 60 * 1000,
  });
  return token;
};
