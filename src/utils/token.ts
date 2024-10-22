import { NextFunction, Request, Response } from "express";
import {
  JsonWebTokenError,
  JwtPayload,
  sign,
  SignOptions,
  verify,
} from "jsonwebtoken";

import { query } from "./db";

export const generateToken = async (
  payload: Record<string, string>,
  secret: string,
  options?: SignOptions
): Promise<string> => {
  return await sign(payload, secret, options);
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      res.status(401).json({
        message: "Header is required.",
        status: 401,
        success: false,
      });
      return;
    }

    const decoded: string | JwtPayload = verify(
      accessToken!,
      process.env.ACCESS_TOKEN_JWT_SECRET!
    );

    let email = "";

    if (decoded && typeof decoded === "object" && decoded.email) {
      email = decoded.email as string;
    }

    const getUser = await query(
      `SELECT * FROM users WHERE Email = '${email.toLowerCase()}'`
    );

    if (getUser.rowCount === 0) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        success: false,
      });
      return;
    }

    if (!getUser.rows[0].isEmailValidated) {
      res.status(401).json({
        message: "Email not validated",
        status: 401,
        success: false,
      });
      return;
    }

    req.body.user = decoded;

    // If token is valid, call next() to pass control to the next middleware
    next();
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        message: error.message,
        status: 401,
        success: false,
      });
      return;
    }

    res.status(500).json({
      message: error,
      status: 500,
      success: false,
    });
    return;
  }
};
