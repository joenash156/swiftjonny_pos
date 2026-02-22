import express, { Router } from "express";
import { changePassword, changeThemePreference, createUser, deleteUser, forgotPassword, generateNewAccessToken, getUserProfile, loginUser, logoutUser, removeAvatar, resendVerificationEmail, resetPassword, updateAvatar, updateUserProfile, verifyEmail } from "../controllers/users.controllers";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter } from "../configs/rateLimiter";
import upload from "../middlewares/uploads.middleware";
import { requireUploadType } from "../middlewares/requireUploadType.middleware";


const router: Router = express.Router();

// router to register user
router.post("/signup", authLimiter, createUser);

// router to verify email
router.get("/verify_email", verifyEmail)

// router to resend verification email
router.post("/resend_verification_email", authLimiter, resendVerificationEmail)

// router to login in user
router.post("/login", authLimiter, loginUser);

// router to get user profile only when logged in (protected route)
router.get("/profile", requireAuth, getUserProfile);

// router to update user profile only when logged in (protected route)
router.patch("/update_profile", requireAuth, updateUserProfile);

// router to update/change user password when logged in (protected router)
router.patch("/change_password", requireAuth, changePassword);

// router for forgot password
router.post("/forgot_password", authLimiter, forgotPassword)

// router to reset user password
router.post("/reset_password", authLimiter, resetPassword)

// router to update/change user theme preference when logged in (protected router)
router.patch("/change_theme_preference", requireAuth, changeThemePreference);

// router to change/update user avatar (protected user)
router.patch("/avatar/update", requireAuth, requireUploadType("avatar"), upload.single("avatar"), updateAvatar)

// router to remove user avatar (protected user)
router.patch("/avatar/remove", requireAuth, requireUploadType("avatar"), upload.single("avatar"), removeAvatar)

// router to refresh to generate new access token
router.post("/refresh", generateNewAccessToken);

// router to log out user
router.post("/logout", logoutUser);

// router to delete user when logged in (protected route)
router.delete("/delete", requireAuth, deleteUser);


export default router;