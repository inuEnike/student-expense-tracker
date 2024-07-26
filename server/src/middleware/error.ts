import { NextFunction, Request, Response } from "express";
import { ENV_DATA } from "../utils/envData";

const errorhandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errName = err.name;
  const errstatus = req.statusCode || 500;
  const errMessage = err.message;
  const stacktrace = ENV_DATA.NODE_ENV === "development" ? err.stack : {};
  const errstatusmessage = req.statusMessage;

  return res.status(errstatus).json({
    success: false,
    errorData: {
      Name: errName,
      statusCode: errstatus,
      Message: errMessage,
      statusMessage: errstatusmessage,
      stackTrace: stacktrace,
    },
  });
};

export default errorhandler;
