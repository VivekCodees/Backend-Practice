import { v2 as cloudinary } from "cloudinary";
import { log } from "console";

// fs = filesystem this library comes by default with Node.js so it can be used anywhere
// we use the filesystem to manage the entire file system eg open,read,permission etc....
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            // These are upload options
            {
                resource_type: "auto",
            }
        );
        // file has been uploaded successfully
        // console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // fs.unlinkSync() is a method in Node.js used to synchronously delete a file from the file system. It is part of the fs (File System) module, which provides functions for interacting with the file system
        // In Node.js, both fs.unlink() and fs.unlinkSync() are used to delete files from the file system. The key difference between them lies in their execution:
        // fs.unlink(): Asynchronous (non-blocking).
        // fs.unlinkSync(): Synchronous (blocking).
        fs.unlinkSync(localFilePath)  //remove the locally saved temporary file as the upload operation gets failed
        return null;
    }
};


export { uploadOnCloudinary }