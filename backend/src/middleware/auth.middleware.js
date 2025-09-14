import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("🔍 Auth Debug - Token received:", token ? "Token exists" : "No token");
    console.log("🔍 Auth Debug - Cookies:", req.cookies);

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Auth Debug - Token decoded:", decoded);

    if (!decoded) {
      console.log("❌ Token could not be decoded");
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("🔍 Auth Debug - User found:", user ? "User exists" : "User not found");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("✅ Auth successful for user:", user.email);

    next();
  } catch (error) {
    console.log("❌ Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Optional auth middleware for routes that can work with or without authentication
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in optionalAuth middleware: ", error.message);
    req.user = null;
    next();
  }
};
