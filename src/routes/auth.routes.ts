import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshTokenHandler,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginLimiter } from "../configs/rateLimiter.js";

const router = express.Router();

router.post("/register", loginLimiter, validate(registerSchema), registerUser);

router.post("/login", loginLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshTokenHandler);

export default router;
