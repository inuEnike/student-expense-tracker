import { NextFunction, Request, Response } from "express";
import { USER } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ENV_DATA } from "../utils/envData";
import transporter from "../utils/mailer";

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
  const { matno, password } = req.body;

  try {
    // Find the user by matno
    const user = await USER.findOne({ matno });

    // If no user is found, send an error response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, send an error response
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Prepare data for the token
    const data = { id: user._id, matno: user.matno, email: user.email };

    // Generate a token
    const token = handleToken(data);

    // Send the response with user data and token
    return res.status(200).json({
      data,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let data = req.user.user;
  const user = await USER.findOne({ matno: data.matno }).select("-password");
  console.log(user);
  const userCoin = user?.coin || 0;
  if (userCoin < 20 && user?.email) {
    await transporter.sendMail({
      from: '"Inu Enike 👻" <inuenike@gmail.com>', // sender address
      to: user?.email, // recipient's email address
      subject: "Low Coin Balance Warning", // subject line
      text: `Hello ${
        user?.surname || "User"
      },\n\nWe noticed that your current coin balance is ${userCoin} coins. While there's no immediate action required, we just wanted to let you know that your balance is getting low. Feel free to top up anytime.\n\nBest regards,\nThe Team`, // plain text body
      html: `
        <h3>Hello ${user?.surname || "User"},</h3>
        <p>This is just a friendly reminder that your current coin balance is <strong>${userCoin} coins</strong>.</p>
        <p>While there's no immediate action required, we thought you might like to know that your balance is getting a little low. Feel free to top up whenever it’s convenient for you.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The Team</strong></p>
      `, // HTML body
    });
    console.log(`Low balance warning email sent to ${user.email}`);
  }
  return res.status(200).json(user);
};

const handleToken = (user: any) => {
  let token = jwt.sign({ user }, ENV_DATA.JWT_SECRET as string, {
    expiresIn: 5 * 24 * 60 * 60 * 1000,
  });
  return token;
};
