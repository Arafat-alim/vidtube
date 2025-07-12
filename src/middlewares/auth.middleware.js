import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async (req, _res, next) => {
  //! fetching the token
  const token =
    req?.cookie?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Token is required");
  }

  try {
    //! verify the token
    const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //! find user in the database
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized User");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid Access token");
  }
});

export { verifyAccessToken };
