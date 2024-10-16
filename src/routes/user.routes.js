import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  logoutUser,
  signIn,
  signUp,
  updateProfileImage,
  updateUserDetails,
  viewExercise,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.user.middlewares.js";

const userRouter = Router();

userRouter.route("/sign-Up").post(upload.single("profile-image"), signUp);
userRouter.route("/sign-In").post(signIn);

//secure routes

userRouter.route("/update-profile-image").post(verifyJWT,upload.single("profile-image"),updateProfileImage);
userRouter.route("/update-profile").post(verifyJWT,updateUserDetails);
userRouter.route("/logout").post(verifyJWT,logoutUser);

userRouter.route("/view-exercise-video").get(verifyJWT,viewExercise);


export default userRouter;
