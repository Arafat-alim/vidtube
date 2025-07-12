import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  deleteCloudinaryImage,
  uploadCLoudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      error.message || "Something went wrong while generating tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;
  // validation
  if (
    [fullName, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user is existing in the database
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already existed.");
  }

  console.log(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path || "";
  const coverLocalPath = req.files?.coverImage?.[0]?.path || "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  let avatarImage = "";
  try {
    //! saving image file into the cloudinary
    avatarImage = await uploadCLoudinary(avatarLocalPath);
    console.log("🚀 ~ registerUser ~ avatarImage:", avatarImage);
  } catch (error) {
    console.error("Failed to upload avatar image to cloudinary: ", error);
    throw new ApiError(500, "Failed to upload an avatar image");
  }

  let coverImage = "";
  try {
    if (coverLocalPath) {
      coverImage = await uploadCLoudinary(coverLocalPath);
      console.log("🚀 ~ registerUser ~ coverImage:", coverImage);
    }
  } catch (error) {
    console.error("Failed to upload cover image to cloudinary: ", error);
    throw new ApiError(500, "Failed to upload an cover image");
  }

  try {
    //! saved to mongodb
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatarImage.url,
      coverImage: coverImage.url ? coverImage.url : "",
    });

    //! find out the user is created or not using mongodb id
    const createdUser = await User.find(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong during registering the user"
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registeresd successfully"));
  } catch (err) {
    console.log("User creation failed: ", err);
    if (avatarImage) {
      await deleteCloudinaryImage(avatarImage.public_id);
    }

    if (coverImage) {
      await deleteCloudinaryImage(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering user and images deleted."
    );
  }
});

const handleLogin = asyncHandler(async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email) {
      throw new ApiError(400, "Email field is missing");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await existingUser.isValidPassword(password);

    if (!isPasswordValid) {
      throw new ApiError(400, "User credential is invalid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      existingUser._id
    );

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );

    if (!loggedInUser) {
      throw new ApiError(404, "User not found");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User loggedin successfully"
        )
      );
  } catch (error) {
    next(error);
  }
});

export { registerUser, handleLogin };
