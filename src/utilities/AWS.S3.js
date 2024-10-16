import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_REGION;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const UploadImageOnS3 = async function (file, fileName) {
  const params = {
    Bucket: bucketName,
    Key: `user/Profile images/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const command = new PutObjectCommand(params);

  return await s3Client.send(command);
};

const getProfileImageUrl = async function (fileName) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `user/Profile images/${fileName}`,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
};

const deleteImageFromS3 = async function (fileName) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `user/Profile images/${fileName}`,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
};

const uploadVideo = async function(file,muscileGroup){
  const params = {
    Bucket: bucketName,
    Key: `exercises/${muscileGroup}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const command = new PutObjectCommand(params);

  return await s3Client.send(command)
}

const getVideo = async function (muscileGroup, exerciseName) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `exercises/${muscileGroup}/${exerciseName}`,
  });

  const url = await getSignedUrl(s3Client, command);
  return url;
};

export { UploadImageOnS3, getProfileImageUrl, getVideo, deleteImageFromS3, uploadVideo };
