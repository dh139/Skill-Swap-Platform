import express from "express"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import User from "../models/User.js"
import { authenticate } from "../middleware/auth.js"
import dotenv from 'dotenv';
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

export default router
