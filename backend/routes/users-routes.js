import express from "express";
import {
  changePassword,
  deleteUser,
  getUserProfile,
  insertUser,
  loginUser,
  logoutUser,
  refreshToken,
  updateUserProfile,
  uploadUserAvatar,
} from "../controllers/users-controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../config/multer.js";

const router = express.Router();

// router to register/signup users
router.post("/signup", insertUser);

// router to get user profile
router.get("/profile", requireAuth, getUserProfile);

// router to refresh to get new access token
router.post("/refresh", refreshToken);

// router to login user
router.post("/login", loginUser);

// router to update user profile (without avatar)
router.patch("/update_profile", requireAuth, updateUserProfile);

// router to upload/update avatar (separate endpoint)
router.post(
  "/upload_avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  uploadUserAvatar
);

// router to change user password
router.patch("/change_password", requireAuth, changePassword);

// router to logout user
router.post("/logout", logoutUser);

// router to delete user
router.delete("/delete", requireAuth, deleteUser);

export default router;
