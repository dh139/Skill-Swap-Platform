// routes/platformMessages.js
import express from "express"
import PlatformMessage from "../models/PlatformMessage.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Get latest platform messages (optional limit)
router.get("/latest", authenticate, async (req, res) => {
  try {
    const messages = await PlatformMessage.find()
      .populate("sentBy", "name")
      .sort({ createdAt: -1 })
      .limit(20) // adjust as needed

    res.json(messages)
  } catch (err) {
    console.error("❌ Error fetching platform messages:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Post a platform-wide message (for admins)
router.post("/", authenticate, async (req, res) => {
  const { content } = req.body

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" })
  }

  try {
    const message = await PlatformMessage.create({
      content,
      sentBy: req.user._id,
    })

    const populated = await message.populate("sentBy", "name")
    res.status(201).json(populated)
  } catch (err) {
    console.error("❌ Error posting platform message:", err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
