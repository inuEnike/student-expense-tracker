import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV_DATA } from "../utils/envData";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeaders = req.headers.authorization;

  try {
    if (authHeaders && authHeaders.startsWith("Bearer ")) {
      const token = authHeaders.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ errorMessage: "Unauthorized || No token provided" });
      }

      jwt.verify(token, ENV_DATA.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          return res.status(403).json({ errorMessage: "Invalid token" });
        }
        req.user = decoded;
        next();
      });
    } else {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized || Invalid token format" });
    }
  } catch (error) {
    next(error);
  }
};
