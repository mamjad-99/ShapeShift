import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDataBase = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\nMongoDB connected !! DB Host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Error in connecting with DB. Error : ${error}`);
    process.exit(1);
  }
};

export default connectDataBase;
