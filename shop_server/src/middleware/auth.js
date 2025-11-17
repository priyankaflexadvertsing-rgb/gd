import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../utils/jwt.js";
import FilesService from "../service/web/user/file.js";



export const updateAccessToken = async (req, res, next) => {
  try {
    const refresh_token = req.headers["refresh-token"] || req.cookies["refreshToken"];
    const decoded = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);


    if (!decoded) {
      return res.status(400).json({ message: "Refresh token is not valid" });
    }

    req.user = decoded;


    return next();
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not refresh access token" });
  }
};



// ✅ Authenticated user middleware
export const isAuthenticated = async (req, res, next) => {
  console.log(req.cookies);
  


  const access_token = req.headers["access-token"] || req.cookies["accessToken"];

  if (!access_token) {
    return res.status(404).json({ message: "Please login to access this resource" });
  }

  const decoded = jwt.decode(access_token);


  if (!decoded) {
    return res.status(400).json({ message: "Access token is not valid" });

  }

  // Check if access token is expired
  if (decoded.exp && decoded.exp <= Date.now() / 1000) {
    try {
      await updateAccessToken(req, res, next);
    } catch (error) {
      return next(error);
    }
  } else {
    req.user = decoded;
    next();
  }
};

// ✅ Role-based authorization middleware
export const authorizeRoles = (...roles) => {


  return async (req, res, next) => {
    const userId = req?.user?.id;

    const user = await FilesService.getUserFileById({ userId: userId })
    console.log(user);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!roles.includes(user.role || "")) {
      return res.status(500).json({
        message: `Role: ${req.user?.role} is not allowed to access this resource`,
      }

      );
    }

    next();
  };
};
