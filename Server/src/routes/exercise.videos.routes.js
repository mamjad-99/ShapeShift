import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  getExerciseVideo,
  getExerciseVideoS3,
  uploadExerciseVideo,
} from "../controllers/exercise.videos.controllers.js";

const exerciseVideosRouter = Router();

exerciseVideosRouter
  .route("/upload-video")
  .post(upload.single("exercise-video"), uploadExerciseVideo);
exerciseVideosRouter.route("/get-video").get(getExerciseVideo);
exerciseVideosRouter.route("/get-video-s3").get(getExerciseVideoS3);

export default exerciseVideosRouter;
