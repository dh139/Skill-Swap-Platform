import mongoose from "mongoose"
import Swap from "../models/Swap.js"
import dotenv from "dotenv"



dotenv.config()

async function cleanupEmptyFeedback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Find completed swaps where feedback exists but has no rating (or is an empty object)
    const result = await Swap.updateMany(
      {
        status: "completed",
        $or: [
          { "feedback.rating": { $exists: false } }, // feedback object exists but rating field is missing
          { feedback: {} }, // feedback is an empty object
        ],
      },
      {
        $unset: { feedback: "" }, // Unset the entire feedback field
      },
    )

    console.log(`Cleaned up ${result.modifiedCount} swaps with empty or incomplete feedback.`)

    process.exit(0)
  } catch (error) {
    console.error("Error cleaning up feedback:", error)
    process.exit(1)
  }
}

cleanupEmptyFeedback()
