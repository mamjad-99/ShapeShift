import { ExerciseVideo } from "../models/exercise.videos.models.js";
import { ApiError } from "../utilities/error.js";
import { ApiResponse } from "../utilities/response.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { getVideo, uploadVideo } from "../utilities/AWS.S3.js";

const uploadExerciseVideo = asyncHandler(async (req, res) => {
  const { muscileGroup, exerciseName } = req.body;

  if (!muscileGroup || !exerciseName)
    throw new ApiError(400, "Something information is missing");

  const video = await uploadVideo(req.file, muscileGroup);

  if (video.$metadata.httpStatusCode != 200)
    throw new ApiError(401, "Error while uploading video");

  const videoURL = await getVideo(muscileGroup, req.file.originalname);

  if (!videoURL) throw new ApiError(401, "Error while getting url of video");

  const exercise = await ExerciseVideo.create({
    muscileGroup,
    exerciseName,
    videoURL,
    fileName: req.file.originalname,
  });

  const storeData = await ExerciseVideo.findById(exercise._id).select(
    "-fileName"
  );

  if (!storeData)
    throw new ApiError(401, "Something went wrong wile storing data");

  res
    .status(200)
    .json(new ApiResponse(200, storeData, "Video upload successfully"));
});

const getExerciseVideo = asyncHandler(async (req, res) => {
  const { muscileGroup, exerciseName } = req.query;

  if (!muscileGroup || !exerciseName)
    throw new ApiError(400, "Something information is missing");

  const exercise = await ExerciseVideo.findOne({ exerciseName }).select(
    "-fileName"
  );

  if (!exercise) throw new ApiError(404, "Exercise video not found");

  res
    .status(200)
    .json(new ApiResponse(200, exercise, "Exercise video send successfully"));
});

const getExerciseVideoS3 = asyncHandler(async (req, res) => {
  const { muscileGroup, exerciseName } = req.query;

  if (!muscileGroup || !exerciseName)
    throw new ApiError(400, "Something information is missing");

  const exercise = await ExerciseVideo.findOne({ exerciseName });

  if (!exercise)
    throw new ApiError(401, "Error while retrevimg data from database");

  const videoURL = await getVideo(muscileGroup, exercise.fileName);

  if (!videoURL) throw new ApiError(401, "Error while getting url of video");

  exercise.videoURL = videoURL;

  res
    .status(200)
    .json(new ApiResponse(200, exercise, "Exercise video send successfully"));
});

export { uploadExerciseVideo, getExerciseVideo, getExerciseVideoS3 };
