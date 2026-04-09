import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // ignore
  }
  return next();
};
