import { verifyAccessToken } from "../helpers/jwt.js";
import db from "../config/database.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = (req.get("Authorization") || "").trim();
  let token = "";

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1].trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Missing authorization token",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    const [rows] = await db.query(
      "SELECT id, email FROM users WHERE id = ?",
      payload.id
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User do not exixt, account may have been deleted",
      });
    }
    req.user = {
      id: payload.id || payload.sub,
      email: payload.email,
    };
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Access token expired",
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid access token",
      });
    }
  }
};
