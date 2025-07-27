import express from "express"
import mongoose from "mongoose"
import Message from "../models/Message.js"
import Swap from "../models/Swap.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// GET messages for a swap (with ObjectId check)
router.get("/:swapId", authenticate, async (req, res) => {
  const { swapId } = req.params

  // 🛡️ Check if swapId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(swapId)) {
    return res.status(400).json({ message: "Invalid swap ID" })
  }

  try {
    const swap = await Swap.findById(swapId)
    if (!swap || swap.status !== "accepted") {
      return res.status(403).json({ message: "Chat not allowed for this swap" })
    }

    const isParticipant =
      swap.requester.toString() === req.user._id.toString() ||
      swap.target.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const messages = await Message.find({ swapId }).populate("sender", "name")

    // You can later enhance here with: unread count, typing, last seen, etc.
    res.json(messages)
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// POST a new message
router.post("/", authenticate, async (req, res) => {
  const { swapId, content } = req.body

  // 🛡️ ObjectId check
  if (!mongoose.Types.ObjectId.isValid(swapId)) {
    return res.status(400).json({ message: "Invalid swap ID" })
  }

  try {
    const swap = await Swap.findById(swapId)
    if (!swap || swap.status !== "accepted") {
      return res.status(403).json({ message: "Chat not allowed for this swap" })
    }

    const isParticipant =
      swap.requester.toString() === req.user._id.toString() ||
      swap.target.toString() === req.user._id.toString()

    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    const message = await Message.create({
      swapId,
      sender: req.user._id,
      content,
    })

    const populated = await message.populate("sender", "name")
    res.status(201).json(populated)
  } catch (err) {
    console.error("❌ Failed to send message:", err)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
