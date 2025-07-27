import express from "express"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import User from "../models/User.js"
import { authenticate } from "../middleware/auth.js"
import dotenv from 'dotenv';

import { sendOTPEmail } from "../utils/mailer.js" // Assuming email functions are in utils/email.js
dotenv.config();
const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, password, location } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" })
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        location,
      })

      await user.save()

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email, password } = req.body

      // Find user
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check if user is banned
      if (user.isBanned) {
        return res.status(403).json({ message: "Account has been banned" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          role: user.role,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isPublic: user.isPublic,
          bio: user.bio,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        location: req.user.location,
        role: req.user.role,
        skillsOffered: req.user.skillsOffered,
        skillsWanted: req.user.skillsWanted,
        availability: req.user.availability,
        isPublic: req.user.isPublic,
        bio: req.user.bio,
        averageRating: req.user.averageRating,
        totalRatings: req.user.totalRatings,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})



// In-memory OTP storage (for simplicity; use Redis or a database in production)
const otpStorage = new Map()

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Forgot Password - Send OTP
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please provide a valid email")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Generate OTP and store it with expiration (5 minutes)
      const otp = generateOTP()
      otpStorage.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 })

      // Send OTP email
      await sendOTPEmail({ to: email, otp, name: user.name })
      res.json({ message: "OTP sent to your email" })
    } catch (error) {
      console.error("Error sending OTP:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Verify OTP
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email, otp } = req.body
      const storedOTP = otpStorage.get(email)

      if (!storedOTP || storedOTP.expires < Date.now()) {
        return res.status(400).json({ message: "OTP expired or invalid" })
      }

      if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" })
      }

      res.json({ message: "OTP verified successfully" })
    } catch (error) {
      console.error("Error verifying OTP:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Reset Password
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email, otp, newPassword } = req.body
      const storedOTP = otpStorage.get(email)

      if (!storedOTP || storedOTP.expires < Date.now()) {
        return res.status(400).json({ message: "OTP expired or invalid" })
      }

      if (storedOTP.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" })
      }

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update password
      user.password = newPassword // Password hashing is handled by UserSchema.pre("save")
      await user.save()

      // Clear OTP
      otpStorage.delete(email)

      res.json({ message: "Password reset successfully" })
    } catch (error) {
      console.error("Error resetting password:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

export default router
