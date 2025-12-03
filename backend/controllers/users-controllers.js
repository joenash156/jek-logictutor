import db from "../config/database.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";
import { deleteOldAvatar } from "../config/multer.js";

const saltRound = 10;

// CONTROLLERS

// controller to create user
export const insertUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // check if required inputs are provided
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "All firstname, lastname, email and password are required!",
    });
  }

  // check if user's email is already registered
  const [rows] = await db.query("SELECT email FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length > 0) {
    return res.status(400).json({
      success: false,
      error: "User with this email already exists!",
    });
  } else {
    // generate an id with uuidv4
    const id = uuidv4();
    // hash password before sent to the database
    const hashedPassword = await bcrypt.hash(password, saltRound);

    // try to query database by sending info
    try {
      const [result] = await db.query(
        "INSERT INTO users (id, firstname, lastname, email, password_hash) VALUES (?, ?, ?, ?, ?)",
        [id, firstname, lastname, email, hashedPassword]
      );
      return res.status(201).json({
        success: true,
        message: "User inserted successfully!✅",
        user: {
          id,
          firstname,
          lastname,
          email,
        },
      });
    } catch (err) {
      console.error("Failed to insert user into the database!: ", err);
      return res.status(500).json({
        success: false,
        error: "Database error",
      });
    }
  }
};

// controller to get user profile
export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT id, firstname, lastname, email, avatar, theme, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "No user found in database",
      });
    }
    const user = rows[0];
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Failed to get user profile: ", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

// controller to login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // check if both were provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and Password are needed",
    });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invalid email or password!",
      });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(404).json({
        success: false,
        error: "Invalid email or password!",
      });
    } else {
      // generate access and refresh token
      const accessToken = signAccessToken({ id: user.id, email: user.email });
      const refreshToken = signRefreshToken({
        id: user.id,
        email: user.email,
      });

      // store refresh token into cookie: httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // hash refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRound);

      // store hashed refresh token into database
      db.query("UPDATE users SET refresh_token_hash = ? WHERE id = ?", [
        hashedRefreshToken,
        user.id,
      ]);

      res.status(200).json({
        success: true,
        message: "User logged in successfully✅",
        accessToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          theme: user.theme,
          avatar: user.avatar,
        },
      });
    }
  } catch (err) {
    console.error("Error logging in user: ", err);
    return res.status(500).json({
      success: false,
      error: "Server error!",
    });
  }
};

// controller to upload/update user avatar
export const uploadUserAvatar = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Get user's current avatar to delete it
    const [userRows] = await db.query("SELECT avatar FROM users WHERE id = ?", [
      userId,
    ]);

    if (userRows.length > 0 && userRows[0].avatar) {
      // Delete old avatar file
      deleteOldAvatar(userRows[0].avatar);
    }

    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar in database
    await db.query("UPDATE users SET avatar = ? WHERE id = ?", [
      avatarUrl,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully!✅",
      avatarUrl,
    });
  } catch (err) {
    console.error("Failed to upload avatar:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to upload avatar",
    });
  }
};

// controller to update user profile (without avatar)
export const updateUserProfile = async (req, res) => {
  const { firstname, lastname } = req.body;
  const userId = req.user.id;

  // check if required fields were provided
  if (!firstname || !lastname) {
    return res.status(400).json({
      success: false,
      error: "Firstname and Lastname are required!",
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET firstname = ?, lastname = ? WHERE id = ?",
      [firstname, lastname, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found in database",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully!✅",
    });
  } catch (err) {
    console.error("Failed updating user profile:", err);
    return res.status(500).json({
      success: false,
      error: "Database Error!❌",
    });
  }
};

// controller to change user password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // check if password was provided
  if (!currentPassword || !newPassword) {
    return res.status(401).json({
      success: false,
      error: "Current and New Passwords are required",
    });
  }

  try {
    // verify user's password first
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found in database",
      });
    }

    const user = rows[0];

    // check if password provided is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is invalid!",
      });
    }

    // hash updated password
    const hashedPassword = await bcrypt.hash(newPassword, saltRound);

    // update password since provided password is correct
    const [result] = await db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hashedPassword, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(401).json({
        success: false,
        error: "Failed to change password, user may not exist",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Password changed successfully!✅",
    });
  } catch (err) {
    console.error("Failed to change password: ", err);
    return res.status(500).json({
      success: false,
      error: "Database error!",
    });
  }
};

// controller to delete user from the database
export const deleteUser = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: "Password is required to delete account",
    });
  }

  try {
    const [rows] = await db.query(
      "SELECT password_hash, avatar FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No user found!",
      });
    }

    const user = rows[0];

    // Confirm the password is valid
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect!",
      });
    }

    // Delete user's avatar file if exists
    if (user.avatar) {
      deleteOldAvatar(user.avatar);
    }

    // Delete user from database
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        error: "Unable to delete user!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully!✅",
    });
  } catch (err) {
    console.error("Failed to delete user: ", err);
    return res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
};

// controller to generate new access token with refresh token
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Refresh token required!",
    });
  }

  try {
    // verify refresh token signature and expiration
    const payload = verifyRefreshToken(refreshToken);
    const userId = payload.id || payload.sub;
    const [rows] = await db.query(
      "SELECT refresh_token_hash FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    const storedHashedRefreshToken = rows[0].refresh_token_hash;
    if (!storedHashedRefreshToken) {
      return res.status(401).json({
        success: false,
        error: "No refresh token stored",
      });
    }

    // verify supplied refresh token
    const isMatch = await bcrypt.compare(
      refreshToken,
      storedHashedRefreshToken
    );
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }

    // generate another refresh token and store into cookie and databaseand issue another access token
    const newAccessToken = signAccessToken({
      id: userId,
      email: payload.email,
    });
    const newRefreshToken = signRefreshToken({
      id: userId,
      email: payload.email,
    });

    // generate new hashed refresh token
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, saltRound);

    // store new hashed refresh token in database
    await db.query("UPDATE users SET refresh_token_hash = ? WHERE id = ?", [
      newHashedRefreshToken,
      userId,
    ]);

    // store the new hashed refresh token in httpOnly cookie
    res.cookie("refreshToken", newAccessToken, {
      httpOnly: true,
      secureHeapUsed: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Failed to refresh: ", err);
    // clear the refresh token from the browser cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      seccure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/user/refresh",
    });

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Refresh token expired",
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }
  }
};

// controller for user logout
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: "Refresh token required",
    });
  }

  try {
    let payload;
    try {
      // try to verify toekn if it is not expired
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      // incase token is expired, decode it manually to be removed from database
      const base64Payload = refreshToken.split(".")[1];
      payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());
    } finally {
      const userId = payload.id || payload.sub;

      // set the refresh token in database to null
      await db.query(
        "UPDATE users SET refresh_token_hash = NULL WHERE id = ?",
        [userId]
      );

      // clear the refresh token from the browser cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "User logged out successfully!✅",
      });
    }
  } catch (err) {
    console.error("Logout error: ", err);
    return res.status(400).json({
      success: false,
      error: "Invalid refresh token to logout user",
    });
  }
};
