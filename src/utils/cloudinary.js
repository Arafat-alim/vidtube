import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadCLoudinary = async (localPath) => {
  try {
    if (!localPath) return null;
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    console.log("File uploaded on cloudinary. File src: ", response.url);
    // once the file uploaded to the cloud, we would like to delete it from server
    fs.unlinkSync(localPath);
    return response;
  } catch (err) {
    console.log("Error occured while uploading: ", err);
    fs.unlinkSync(localPath);
    return null;
  }
};

const deleteCloudinaryImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from cloudinary successfully: ", publicId);
  } catch (error) {
    console.log("Failed to delete an image from cloudinary: ", error);
    return null;
  }
};

export { uploadCLoudinary, deleteCloudinaryImage };
