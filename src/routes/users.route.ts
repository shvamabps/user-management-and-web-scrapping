import { Router } from "express";

import {
  GenerateNewAccessTokenController,
  UserLoginController,
  UserRegistrationController,
  ValidateEmailOTPController,
} from "../controller/users.controller";
import {
  GenerateNewAccessTokenDTO,
  LoginUserDTO,
  RegisterUserDTO,
  ValidateUserEmailDTO,
} from "../dto/users.dto";
import { verifyToken } from "../utils/token";
import { validateDTO } from "../utils/zod";

const router = Router();

router.post(
  "/register",
  validateDTO(RegisterUserDTO),
  UserRegistrationController
);

router.post("/login", validateDTO(LoginUserDTO), UserLoginController);

router.post(
  "/validate-email",
  validateDTO(ValidateUserEmailDTO),
  ValidateEmailOTPController
);

router.post(
  "/refresh-token",
  validateDTO(GenerateNewAccessTokenDTO),
  verifyToken,
  GenerateNewAccessTokenController
);

export { router as UserRouter };
