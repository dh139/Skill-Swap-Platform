import express from "express"
import { body, validationResult } from "express-validator"
import User from "../models/User.js"
import Swap from "../models/Swap.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Get user stats for dashboard
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user._id

    const [totalSwaps, pendingRequests, completedSwaps] = await Promise.all([
      Swap.countDocuments({
        $or: [{ requester: userId }, { target: userId }],
      }),
      Swap.countDocuments({
        $or: [{ requester: userId }, { target: userId }],
        status: "pending",
      }),
      Swap.countDocuments({
        $or: [{ requester: userId }, { target: userId }],
        status: "completed",
      }),
    ])

    res.json({
      totalSwaps,
      pendingRequests,
      completedSwaps,
      averageRating: req.user.averageRating || 0,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Browse public users
router.get("/browse", authenticate, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isPublic: true,
      isBanned: false,
    })
      .select("-password -email")
      .sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    console.error("Error browsing users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticate,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, location, bio, skillsOffered, skillsWanted, availability, isPublic } = req.body

      // Check if email is already taken by another user
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
        if (existingUser) {
          return res.status(400).json({ message: "Email already taken" })
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          name,
          email,
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
      console.error("Error updating profile:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.isPublic && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Profile is private" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user feedback/reviews
router.get("/:id/feedback", authenticate, async (req, res) => {
  try {
    const userId = req.params.id

    // Find all completed swaps where this user was involved and feedback was given
    const swapsWithFeedback = await Swap.find({
      $or: [{ requester: userId }, { target: userId }],
      status: "completed",
      feedback: { $exists: true },
    })
      .populate("requester target", "name")
      .sort({ "feedback.createdAt": -1 })

    // Filter feedback where the user being viewed is the recipient (not the reviewer)
    const userFeedback = swapsWithFeedback
      .filter((swap) => {
        // If the user being viewed is the requester, they should receive feedback from target
        // If the user being viewed is the target, they should receive feedback from requester
        const isUserRequester = swap.requester._id.toString() === userId
        const isUserTarget = swap.target._id.toString() === userId
        const reviewerId = swap.feedback.reviewer.toString()

        return (
          (isUserRequester && reviewerId === swap.target._id.toString()) ||
          (isUserTarget && reviewerId === swap.requester._id.toString())
        )
      })
      .map((swap) => swap.feedback)

    res.json(userFeedback)
  } catch (error) {
    console.error("Error fetching user feedback:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
