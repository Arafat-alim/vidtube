import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchedHistory,
  handleLogin,
  handleLogout,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

//! unsecured routes
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
userRouter.route("/refresh-token").post(refreshAccessToken);

//! secured routes
userRouter.route("/logout").get(verifyAccessToken, handleLogout);
userRouter
  .route("/change-password")
  .post(verifyAccessToken, changeCurrentPassword);
userRouter.route("/current-user").get(verifyAccessToken, getCurrentUser);
userRouter.route("/c/:username").get(verifyAccessToken, getUserChannelProfile);
userRouter
  .route("/update-account")
  .patch(verifyAccessToken, updateAccountDetails);

userRouter
  .route("/avatar")
  .patch(verifyAccessToken, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/cover-image")
  .patch(verifyAccessToken, upload.single("coverImage"), updateUserCover);

userRouter.route("/history").get(verifyAccessToken, getWatchedHistory);

export { userRouter };
