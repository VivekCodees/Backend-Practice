import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB Connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error Occurred:", error);
    // process.exit() is a method in Node.js used to exit a running process and terminate the application. It's particularly useful for scripts or applications where you need to stop execution based on certain conditions
    // Optional(Parameters): The exit code that indicates why the process is exiting. It can be any integer value, but there are common conventions:
    // 0: Successful exit (default). The process ends without errors.
    // Non-zero values (like 1, 2, etc.): Represent failure or errors. By convention, 1 often means a generic error, but other numbers can be used to signify specific reasons for the exit.
    process.exit(1);
  }
};

export default connectDB;
