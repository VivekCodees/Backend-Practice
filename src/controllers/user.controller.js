import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/*
const registerUser = asyncHandler( async ( req , res) => {
    // get user details from frontend
    // validation - for not empty
    // check if user already exists: check using: username and email
    // check for images, check for avatar
    // upload them to cloudinary, check avatar
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response 
} )
*/

// extracted all the data points like username etc from req.body
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  // console.log("Fullname:", fullName);
  // console.log("Email:", email);

  // if(fullName === ""){
  //     throw new ApiError(400, "Full Name is reqd....")
  // }

  // here we check all the data points if they are empty or not
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields is reqd....");
  }

  // checking whether the user already exist using username or email id
  const existedUser = await User.findOne({
    $or: [ {username} , {email} ]
  })

  if(existedUser){
    throw new ApiError(409, "User email or username already exists")
  }
  // console.log(req.files);
  

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImgLocalPath = req.files?.coverImage[0]?.path;

  let coverImgLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImgLocalPath = req.files.coverImage[0].path
  }

  if(!avatarLocalPath){
    throw new ApiError(400, 'Avatar file is Required!')
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImgLocalPath)


  // if avatar is not present throw an error or upload the avatar on cloudinary
  if(!avatar){
    throw new ApiError(400,'Avatar file required!')
  }

  // if everything is fine then we create an object User using .create 
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  // Here we're checking whether the user is created or not:

  // by using select everything is selected by default but we want password and refreshToken not to be selected so we give a -ve sign to it 
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

});

export { registerUser };    
