import { asyncHandler } from "../utilities/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utilities/error.js";
import { ApiResponse } from "../utilities/response.js";
import {
  getProfileImageUrl,
  UploadImageOnS3,
  deleteImageFromS3,
  getVideo,
} from "../utilities/AWS.S3.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const signUp = asyncHandler(async (req, res) => {
  const { username, password, email, height, weight, gander, age } = req.body;

  if (
    [username, password, email, height, weight, gander, age].some(
      (field) => field?.trim() === ""
    )
  )
    throw new ApiError(400, "All Fields Are Required");

  if (!email.includes("@") || !email.includes(".com"))
    throw new ApiError(400, "Email is not in correct format");

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser)
    throw new ApiError(409, "User with same email or username already exists ");

  const profileImageName = `${Date.now()}_${req.file.originalname}`;

  const uploadImg = await UploadImageOnS3(req.file, profileImageName);

  if (uploadImg.$metadata.httpStatusCode != 200)
    throw new ApiError(401, "Error while uploading profile image");

  const avatar = await getProfileImageUrl(profileImageName);

  if (!avatar)
    throw new ApiError(401, "Error while generating profile image URL");

  const user = await User.create({
    username,
    email,
    password,
    gander,
    age,
    weight,
    avatar,
    profileImageName,
    height,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -profileImageName"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user");

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"));
});

const signIn = asyncHandler(async (req, res) => {
  const { password, emailOrUsername } = req.body;

  if ([emailOrUsername, password].some((field) => field?.trim() === ""))
    throw new ApiError(400, "username/email and password is required");

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  });

  if (!user) throw new ApiError(401, "username/email is incorrect");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -profileImageName"
  );

  //after this cookie only modified by server
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from docume
      },
    },
    {
      new: true, //to get updated values when we access again this user data
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  let profileImageName = req.user.profileImageName;

  const deleteImg = await deleteImageFromS3();

  if (!deleteImg)
    throw new ApiError(401, "Error while deleting previous profile image");

  profileImageName = `${Date.now()}_${req.file.originalname}`;
  const imageRes = await UploadImageOnS3(req.file, profileImageName);

  if (imageRes.$metadata.httpStatusCode != 200)
    throw new ApiError(401, "Error while uploading profile image");

  const avatar = await getProfileImageUrl(profileImageName);

  if (!avatar)
    throw new ApiError(401, "Error while generating profile image URL");

  user.avatar = avatar;

  user.profileImageName = profileImageName;

  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { avatar }, "Profile image update successfully")
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, height, weight, caloriesGoal, weightGoal } = req.body;

  if (!username && !height && !weight && !caloriesGoal && !weightGoal)
    throw new ApiError(400, "All fields are required");

  const existedUser = await User.findOne({ username });

  if (existedUser) throw new ApiError(400, "Username is taken");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        height,
        weight,
        caloriesGoal,
        weightGoal,
      },
    },
    { new: true }
  ).select("-password -refreshToken -profileImageName");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update successfully"));
});

const viewExercise = asyncHandler(async (req, res) => {
  console.log(req.query);
  const { exerciseName, muscileGroup } = req.query;

  if (!exerciseName || !muscileGroup)
    throw new ApiError(400, "Some details are missing");

  const url = await getVideo(muscileGroup, exerciseName);
  console.log(url);

  res
    .status(200)
    .json(new ApiResponse(200, url, "Exercise video send successfully"));
});

export {
  signUp,
  signIn,
  logoutUser,
  updateProfileImage,
  updateUserDetails,
  viewExercise,
};
