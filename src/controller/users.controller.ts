import type { Request, Response } from "express";
import { registerUsers } from "../services/users.service";

export const UserController = async (req: Request, res: Response) => {
  try {
    const user = await registerUsers(req.body);
    return res.status(user.status).json(user);
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ message: error, status: 500, success: false });
  }
};
