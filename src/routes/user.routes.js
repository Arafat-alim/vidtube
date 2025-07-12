import { Router } from "express";
import {
  handleLogin,
  handleLogout,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar", // field name
      maxCount: 1,
    },
    {
      name: "coverImage", // field name
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.route("/login").post(handleLogin);
userRouter.route("/logout").get(verifyAccessToken, handleLogout);

export { userRouter };
