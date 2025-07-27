import mongoose from "mongoose"
import Swap from "../models/Swap.js"
import dotenv from "dotenv"
import bcrypt from 'bcryptjs'; // or 'bcrypt'
dotenv.config()

async function resetIncompleteFeedback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Find completed swaps where feedback exists but feedback.rating does NOT exist
    const result = await Swap.updateMany(
      {
        status: "completed",
        "feedback.rating": { $exists: false }, // Feedback object exists, but rating field is missing
      },
      {
        $unset: { feedback: "" }, // Unset the entire feedback field
      },
    )

    console.log(`Cleaned up ${result.modifiedCount} completed swaps with incomplete feedback.`)

    process.exit(0)
  } catch (error) {
    console.error("Error resetting incomplete feedback:", error)
    process.exit(1)
  }
}

resetIncompleteFeedback()
