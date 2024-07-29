import { Router } from "express";
import { UserController } from "../controller/users.controller";
import { RegisterUserDTO } from "../dto/users.dto";
import { validateDTO } from "../utils/zod";

const router = Router();

router.post("/register", validateDTO(RegisterUserDTO), UserController);

export { router as UserRouter };
