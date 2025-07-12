import express from "express"
import { body, validationResult } from "express-validator"
import Swap from "../models/Swap.js"
import User from "../models/User.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Create swap request
router.post(
  "/request",
  authenticate,
  [
    body("targetUserId").isMongoId().withMessage("Invalid target user ID"),
    body("message").optional().isLength({ max: 500 }).withMessage("Message too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { targetUserId, message, skillsRequested, skillsOffered } = req.body

      // Check if target user exists
      const targetUser = await User.findById(targetUserId)
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" })
      }

      // Check if user is trying to request swap with themselves
      if (targetUserId === req.user._id.toString()) {
        return res.status(400).json({ message: "Cannot request swap with yourself" })
      }

      // Check if there's already a pending request between these users
      const existingRequest = await Swap.findOne({
        $or: [
          { requester: req.user._id, target: targetUserId, status: "pending" },
          { requester: targetUserId, target: req.user._id, status: "pending" },
        ],
      })

      if (existingRequest) {
        return res.status(400).json({ message: "There is already a pending request between you and this user" })
      }

      const swap = new Swap({
        requester: req.user._id,
        target: targetUserId,
        message,
        skillsRequested: skillsRequested || [],
        skillsOffered: skillsOffered || [],
      })

      await swap.save()
      await swap.populate(["requester", "target"], "name email")

      res.status(201).json({
        message: "Swap request sent successfully",
        swap,
      })
    } catch (error) {
      console.error("Error creating swap request:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get user's swap requests
router.get("/my-requests", authenticate, async (req, res) => {
  try {
    const [sent, received] = await Promise.all([
      Swap.find({ requester: req.user._id }).populate("target", "name email").sort({ createdAt: -1 }),
      Swap.find({ target: req.user._id }).populate("requester", "name email").sort({ createdAt: -1 }),
    ])

    res.json({ sent, received })
  } catch (error) {
    console.error("Error fetching swap requests:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Accept swap request
router.put("/:id/accept", authenticate, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }

    if (swap.target.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" })
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" })
    }

    swap.status = "accepted"
    await swap.save()

    res.json({ message: "Swap request accepted", swap })
  } catch (error) {
    console.error("Error accepting swap request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reject swap request
router.put("/:id/reject", authenticate, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }

    if (swap.target.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" })
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ message: "Request is no longer pending" })
    }

    swap.status = "rejected"
    await swap.save()

    res.json({ message: "Swap request rejected", swap })
  } catch (error) {
    console.error("Error rejecting swap request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Complete swap
router.put("/:id/complete", authenticate, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" })
    }

    const isParticipant =
      swap.requester.toString() === req.user._id.toString() || swap.target.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to complete this swap" })
    }

    if (swap.status !== "accepted") {
      return res.status(400).json({ message: "Swap must be accepted before completion" })
    }

    swap.status = "completed"
    swap.completedDate = new Date()
    await swap.save()

    // Update user swap counts
    await Promise.all([
      User.findByIdAndUpdate(swap.requester, { $inc: { totalSwaps: 1 } }),
      User.findByIdAndUpdate(swap.target, { $inc: { totalSwaps: 1 } }),
    ])

    res.json({ message: "Swap marked as completed", swap })
  } catch (error) {
    console.error("Error completing swap:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete swap request
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" })
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this request" })
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ message: "Can only delete pending requests" })
    }

    await Swap.findByIdAndDelete(req.params.id)

    res.json({ message: "Swap request deleted successfully" })
  } catch (error) {
    console.error("Error deleting swap request:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Submit feedback
router.post(
  "/:id/feedback",
  authenticate,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isLength({ max: 500 }).withMessage("Comment too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { rating, comment } = req.body
      const swap = await Swap.findById(req.params.id)

      if (!swap) {
        return res.status(404).json({ message: "Swap not found" })
      }

      const isParticipant =
        swap.requester.toString() === req.user._id.toString() || swap.target.toString() === req.user._id.toString()

      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized to leave feedback for this swap" })
      }

      if (swap.status !== "completed") {
        return res.status(400).json({ message: "Can only leave feedback for completed swaps" })
      }

      // *** FIX: Check for existing feedback.rating instead of just feedback object ***
      if (swap.feedback && swap.feedback.rating) {
        return res.status(400).json({ message: "Feedback already submitted for this swap" })
      }

      // Add feedback to swap
      swap.feedback = {
        rating: Number.parseInt(rating),
        comment: comment || "",
        reviewer: req.user._id,
        createdAt: new Date(),
      }
      await swap.save()

      // Update the other user's rating
      const otherUserId = swap.requester.toString() === req.user._id.toString() ? swap.target : swap.requester

      const otherUser = await User.findById(otherUserId)
      const newTotalRatings = otherUser.totalRatings + 1
      const newAverageRating =
        (otherUser.averageRating * otherUser.totalRatings + Number.parseInt(rating)) / newTotalRatings

      await User.findByIdAndUpdate(otherUserId, {
        averageRating: newAverageRating,
        totalRatings: newTotalRatings,
      })

      res.json({ message: "Feedback submitted successfully", swap })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get recent activity
router.get("/recent", authenticate, async (req, res) => {
  try {
    const recentSwaps = await Swap.find({
      $or: [{ requester: req.user._id }, { target: req.user._id }],
    })
      .populate(["requester", "target"], "name")
      .sort({ createdAt: -1 })
      .limit(5)

    const activity = recentSwaps.map((swap) => {
      const isRequester = swap.requester._id.toString() === req.user._id.toString()
      const otherUser = isRequester ? swap.target : swap.requester

      return {
        title: `Swap ${swap.status}`,
        description: `${isRequester ? "Request to" : "Request from"} ${otherUser.name}`,
        date: swap.createdAt.toLocaleDateString(),
      }
    })

    res.json(activity)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
