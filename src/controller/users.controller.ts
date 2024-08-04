import type { Request, Response } from "express";
import {
  generateNewAccessToken,
  loginUsers,
  registerUsers,
  validateEmailOTP,
} from "../services/users.service";

export const UserRegistrationController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await registerUsers(req.body);
    return res.status(user.status).json(user);
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ message: error, status: 500, success: false });
  }
};

export const UserLoginController = async (req: Request, res: Response) => {
  try {
    const user = await loginUsers(req.body);
    return res.status(user.status).json(user);
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ message: error, status: 500, success: false });
  }
};

export const ValidateEmailOTPController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await validateEmailOTP(req.body);
    return res.status(user.status).json(user);
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ message: error, status: 500, success: false });
  }
};

export const GenerateNewAccessTokenController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await generateNewAccessToken(req.body);
    return res.status(user.status).json(user);
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ message: error, status: 500, success: false });
  }
};
