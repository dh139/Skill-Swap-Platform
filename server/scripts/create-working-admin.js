import mongoose from "mongoose"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

async function createWorkingAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Delete existing admin
    await User.deleteOne({ email: "admin@skillswap.com" })
    console.log("Removed existing admin user")

    // Create admin using the User model (this will trigger the pre-save middleware)
    const admin = new User({
      name: "Admin User",
      email: "admin@skillswap.com",
      password: "admin123", // Plain text - let the model handle hashing
      role: "admin",
      location: "Platform",
      bio: "System Administrator",
      skillsOffered: ["Platform Management"],
      skillsWanted: [],
      availability: "Always available",
      isPublic: true,
    })

    // Save the user (this will trigger password hashing)
    await admin.save()
    console.log("✅ Admin user created using User model")

    // Fetch the saved user and test password
    const savedAdmin = await User.findOne({ email: "admin@skillswap.com" })
    console.log("Saved admin password hash:", savedAdmin.password)

    // Test the password
    const passwordTest = await savedAdmin.comparePassword("admin123")
    console.log("Password test result:", passwordTest ? "✅ SUCCESS" : "❌ FAILED")

    if (passwordTest) {
      console.log("\n🎉 Admin account is ready!")
      console.log("Email: admin@skillswap.com")
      console.log("Password: admin123")
      console.log("You can now login to the admin panel!")
    } else {
      console.log("\n❌ Password test still failed. There might be an issue with the User model.")
    }

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error)
    process.exit(1)
  }
}

createWorkingAdmin()
