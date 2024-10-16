import { User } from "../models/user.models.js";
import { ApiError } from "../utilities/error.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedInformation = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SCRETE
    );

    const user = await User.findById(decodedInformation?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid access token")
  }
});
