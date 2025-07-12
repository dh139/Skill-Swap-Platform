import express from "express"
import PlatformMessage from "../models/PlatformMessage.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Get latest platform messages
router.get("/latest", authenticate, async (req, res) => {
  try {
    const messages = await PlatformMessage.find()
      .populate("sentBy", "name") // Populate the sender's name
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Get the latest 5 messages

    res.json(messages)
  } catch (error) {
    console.error("Error fetching platform messages:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
