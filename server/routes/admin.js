import express from "express"
import User from "../models/User.js"
import Swap from "../models/Swap.js"
import Report from "../models/Report.js" // Ensure Report model is imported
import { authenticate, requireAdmin } from "../middleware/auth.js"
import PlatformMessage from "../models/PlatformMessage.js"

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin)

// Get admin stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalSwaps, pendingReports, activeUsers] = await Promise.all([
      User.countDocuments(),
      Swap.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      User.countDocuments({ isBanned: false }),
    ])

    res.json({
      totalUsers,
      totalSwaps,
      pendingReports,
      activeUsers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all swaps
router.get("/swaps", async (req, res) => {
  try {
    const swaps = await Swap.find().populate(["requester", "target"], "name email").sort({ createdAt: -1 })

    res.json(swaps)
  } catch (error) {
    console.error("Error fetching swaps:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Ban user
router.put("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User banned successfully", user })
  } catch (error) {
    console.error("Error banning user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Unban user
router.put("/users/:id/unban", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User unbanned successfully", user })
  } catch (error) {
    console.error("Error unbanning user:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Send platform-wide message (placeholder - would integrate with email service)
// For now, we'll store it in the database for users to fetch
router.post("/broadcast", async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" })
    }

    const platformMessage = new PlatformMessage({
      content: message,
      sentBy: req.user._id,
    })
    await platformMessage.save()

    res.json({ message: "Message sent to all users successfully" })
  } catch (error) {
    console.error("Error broadcasting message:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update report status (resolve/dismiss)
router.put("/reports/:id/status", async (req, res) => {
  try {
    const { status, adminNotes } = req.body // status can be 'resolved' or 'dismissed'

    if (!["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" })
    }

    const report = await Report.findById(req.params.id)

    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }

    if (report.status !== "pending" && report.status !== "investigating") {
      return res.status(400).json({ message: `Report is already ${report.status}` })
    }

    report.status = status
    report.adminNotes = adminNotes || ""
    report.resolvedBy = req.user._id
    report.resolvedAt = new Date()

    await report.save()

    res.json({ message: `Report marked as ${status}`, report })
  } catch (error) {
    console.error("Error updating report status:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Download reports (placeholder - would generate CSV files)
router.get("/reports/:type", async (req, res) => {
  try {
    const { type } = req.params

    let data = []
    const filename = `${type}-report.csv`

    switch (type) {
      case "users":
        const users = await User.find().select("-password")
        data = users.map((user) => ({
          name: user.name,
          email: user.email,
          location: user.location || "N/A",
          skillsOffered: user.skillsOffered.join("; "),
          skillsWanted: user.skillsWanted.join("; "),
          totalSwaps: user.totalSwaps,
          averageRating: user.averageRating,
          createdAt: user.createdAt.toISOString(),
        }))
        break

      case "swaps":
        const swaps = await Swap.find().populate(["requester", "target"], "name email")
        data = swaps.map((swap) => ({
          requester: swap.requester?.name || "N/A", // Use optional chaining
          target: swap.target?.name || "N/A", // Use optional chaining
          status: swap.status,
          createdAt: swap.createdAt.toISOString(),
          completedAt: swap.completedDate ? swap.completedDate.toISOString() : "N/A",
          rating: swap.feedback?.rating || "N/A", // Use optional chaining
        }))
        break

      case "feedback":
        const feedbackSwaps = await Swap.find({ feedback: { $exists: true, $ne: {} } }).populate([
          "requester",
          "target",
          "feedback.reviewer",
        ]) // Populate feedback.reviewer
        data = feedbackSwaps.map((swap) => ({
          // Use optional chaining and nullish coalescing for safety
          reviewer:
            swap.feedback?.reviewer?.name ||
            (swap.feedback?.reviewer?.toString() === swap.requester?._id.toString()
              ? swap.requester?.name
              : swap.target?.name) ||
            "N/A",
          reviewee:
            (swap.feedback?.reviewer?.toString() === swap.requester?._id.toString()
              ? swap.target?.name
              : swap.requester?.name) || "N/A",
          rating: swap.feedback?.rating || "N/A",
          comment: swap.feedback?.comment || "N/A",
          createdAt: swap.feedback?.createdAt?.toISOString() || "N/A",
        }))
        break

      default:
        return res.status(400).json({ message: "Invalid report type" })
    }

    // Convert to CSV format
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for this report type" })
    }

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => {
          // Ensure values are strings and handle commas within values
          const stringValue = String(value)
          return `"${stringValue.replace(/"/g, '""')}"` // Escape double quotes
        })
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
