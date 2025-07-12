import mongoose from "mongoose"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    const admin = await User.findOne({ email: "admin@skillswap.com" })

    if (admin) {
      console.log("Found admin user:")
      console.log("- Name:", admin.name)
      console.log("- Email:", admin.email)
      console.log("- Role:", admin.role)
      console.log("- Password hash:", admin.password.substring(0, 20) + "...")
      console.log("- Created:", admin.createdAt)

      // Test password comparison
      const passwordTest = await admin.comparePassword("admin123")
      console.log("- Password 'admin123' works:", passwordTest ? "✅ YES" : "❌ NO")
    } else {
      console.log("❌ No admin user found with email: admin@skillswap.com")
    }

    process.exit(0)
  } catch (error) {
    console.error("Error checking admin:", error)
    process.exit(1)
  }
}

checkAdmin()
