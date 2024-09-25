import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

/* 
**Difference between access token and refresh tokens:
An access token is a short-lived credential used to authenticate and authorize a user's access to protected resources, such as APIs, by including it in the Authorization header. It typically expires quickly for security reasons, limiting the time an attacker can exploit it if compromised. On the other hand, a refresh token is a long-lived token used to obtain a new access token without requiring the user to log in again. While access tokens are used directly for accessing resources, refresh tokens are kept secure and exchanged for new access tokens when the original expires, helping maintain session continuity.
*/
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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

/*
Steps to register user
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
// Register User
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
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User email or username already exists");
  }
  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImgLocalPath = req.files?.coverImage[0]?.path;

  let coverImgLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  // if avatar is not present throw an error or upload the avatar on cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file required!");
  }

  // if everything is fine then we create an object User using .create
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Here we're checking whether the user is created or not:

  // by using select everything is selected by default but we want password and refreshToken not to be selected so we give a -ve sign to it
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

/*
  Login User:
  Steps to login user:
  req body -> data
  check username or email
  find user exists or not
  check password if user found
  if password is correct then generate access and refresh token and send it to the user through cookies!
  */

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required!!");
  }

  // Find the user using the username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // When httpOnly and secure is set to true, the cookie can only be modified from the server and not from the frontend
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
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // to logout a user firstly we have to clear out their cookies and clear out the refreshToken
  // findByIdAndUpdate method is searching the user based on id and the set operator is updating the field i.e refreshToken is cleared out
  // The option { new: true } ensures that the function returns the updated user with the refreshToken set to undefined rather than the old document before the update.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
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
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

/* 
**Difference between access token and refresh tokens:
An access token is a short-lived credential used to authenticate and authorize a user's access to protected resources, such as APIs, by including it in the Authorization header. It typically expires quickly for security reasons, limiting the time an attacker can exploit it if compromised. On the other hand, a refresh token is a long-lived token used to obtain a new access token without requiring the user to log in again. While access tokens are used directly for accessing resources, refresh tokens are kept secure and exchanged for new access tokens when the original expires, helping maintain session continuity.
*/

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised Request!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token has been expired or been used");
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed!!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token")
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
