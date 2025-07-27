
import express from "express"
import { body, validationResult, param } from "express-validator"
import User from "../models/User.js"
import Swap from "../models/Swap.js"
import { authenticate } from "../middleware/auth.js"
import mongoose from "mongoose"
import rateLimit from "express-rate-limit"

const router = express.Router()

// Rate limiter for browse and user lookup routes
const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per IP
  message: { message: "Too many requests, please try again later." },
})

// Get user stats for dashboard
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user._id

    // Use aggregation for efficient stats calculation
    const stats = await Swap.aggregate([
      {
        $match: {
          $or: [{ requester: new mongoose.Types.ObjectId(userId) }, { target: new mongoose.Types.ObjectId(userId) }],
        },
      },
      {
        $group: {
          _id: null,
          totalSwaps: { $sum: 1 },
          pendingRequests: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          completedSwaps: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ])

    const user = await User.findById(userId).select("averageRating")

    res.json({
      totalSwaps: stats[0]?.totalSwaps || 0,
      pendingRequests: stats[0]?.pendingRequests || 0,
      completedSwaps: stats[0]?.completedSwaps || 0,
      averageRating: user?.averageRating || 0,
    })
  } catch (error) {
    console.error(`Error fetching user stats for user ${req.user._id}:`, error)
    res.status(500).json({ message: "Failed to fetch user stats" })
  }
})

// Browse public users
router.get("/browse", authenticate, browseLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const users = await User.find({
      _id: { $ne: req.user._id },
      isPublic: true,
      isBanned: false,
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalUsers = await User.countDocuments({
      _id: { $ne: req.user._id },
      isPublic: true,
      isBanned: false,
    })

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    })
  } catch (error) {
    console.error(`Error browsing users for user ${req.user._id}:`, error)
    res.status(500).json({ message: "Failed to browse users" })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticate,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("mobileNumber")
      .optional({ checkFalsy: true })
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage("Please provide a valid mobile number"),
    body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
    body("skillsOffered").optional().isArray().withMessage("Skills offered must be an array"),
    body("skillsWanted").optional().isArray().withMessage("Skills wanted must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, mobileNumber, location, bio, skillsOffered, skillsWanted, availability, isPublic } = req.body

      // Check if email is already taken
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
        if (existingUser) {
          return res.status(400).json({ message: "Email already taken" })
        }
      }

      // Check if mobile number is already taken
      if (mobileNumber && mobileNumber !== req.user.mobileNumber) {
        const existingUser = await User.findOne({ mobileNumber, _id: { $ne: req.user._id } })
        if (existingUser) {
          return res.status(400).json({ message: "Mobile number already taken" })
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          name,
          email,
          mobileNumber,
          location,
          bio,
          skillsOffered: skillsOffered || [],
          skillsWanted: skillsWanted || [],
          availability,
          isPublic: isPublic !== false,
        },
        { new: true, runValidators: true },
      ).select("-password")

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      })
    } catch (error) {
      console.error(`Error updating profile for user ${req.user._id}:`, error)
      res.status(500).json({ message: "Failed to update profile" })
    }
  },
)

// Get user by ID
router.get(
  "/:id",
  authenticate,
  browseLimiter,
  [param("id").isMongoId().withMessage("Invalid user ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const user = await User.findById(req.params.id).select("-password -email")

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      const isOwnProfile = user._id.toString() === req.user._id.toString()

      if (!user.isPublic && !isOwnProfile) {
        return res.status(403).json({ message: "This profile is private" })
      }

      res.json(user)
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error)
      res.status(500).json({ message: "Failed to fetch user" })
    }
  },
)

// Get user feedback/reviews
router.get(
  "/:id/feedback",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid user ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const userId = req.params.id

      const swapsWithFeedback = await Swap.find({
        $or: [{ requester: userId }, { target: userId }],
        status: "completed",
        feedback: { $exists: true },
      })
        .populate("requester target", "name")
        .sort({ "feedback.createdAt": -1 })

      const userFeedback = swapsWithFeedback
        .filter((swap) => {
          const isUserRequester = swap.requester._id.toString() === userId
          const isUserTarget = swap.target._id.toString() === userId
          const reviewerId = swap.feedback.reviewer.toString()

          return (
            (isUserRequester && reviewerId === swap.target._id.toString()) ||
            (isUserTarget && reviewerId === swap.requester._id.toString())
          )
        })
        .map((swap) => ({
          ...swap.feedback,
          reviewerName: swap.requester._id.toString() === userId ? swap.target.name : swap.requester.name,
        }))

      res.json(userFeedback)
    } catch (error) {
      console.error(`Error fetching feedback for user ${req.params.id}:`, error)
      res.status(500).json({ message: "Failed to fetch feedback" })
    }
  },
)

export default router
