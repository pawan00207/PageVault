//middleware/auth.middleware.js
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req, res, next) => {  
  const token = req.cookies.token

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
      data: null
    });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      data: null
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
        data: null
      });
    }
    next();
  };
};

export const checkAdminKey = (req, res, next) => {
  if (req.params.key === "123456") next();
  else res.status(401).json({
    success: false,
    message: "Unauthorized access",
    data: null
  });
};