import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@skillswap.com",
    password: "admin123",
    role: "admin",
    location: "New York, NY",
    bio: "Platform administrator",
    skillsOffered: ["Platform Management", "User Support"],
    skillsWanted: ["Community Building"],
    availability: "Always available",
    isPublic: true,
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    location: "San Francisco, CA",
    bio: "Software developer passionate about teaching and learning new skills",
    skillsOffered: ["JavaScript", "React", "Node.js", "Python"],
    skillsWanted: ["UI/UX Design", "Photography", "Spanish"],
    availability: "Weekends and evenings",
    isPublic: true,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    location: "Los Angeles, CA",
    bio: "Graphic designer and photographer looking to expand my technical skills",
    skillsOffered: ["Photoshop", "Illustrator", "Photography", "UI/UX Design"],
    skillsWanted: ["Web Development", "JavaScript", "Marketing"],
    availability: "Flexible schedule",
    isPublic: true,
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "password123",
    location: "Chicago, IL",
    bio: "Marketing professional and language enthusiast",
    skillsOffered: ["Digital Marketing", "Spanish", "French", "Content Writing"],
    skillsWanted: ["Programming", "Data Analysis", "Guitar"],
    availability: "Weekends",
    isPublic: true,
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "password123",
    location: "Austin, TX",
    bio: "Music teacher and data analyst",
    skillsOffered: ["Piano", "Guitar", "Music Theory", "Excel", "Data Analysis"],
    skillsWanted: ["Web Design", "Cooking", "Yoga"],
    availability: "Evenings and weekends",
    isPublic: true,
  },
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
    console.log("Connected to MongoDB")

    // Clear existing users
    await User.deleteMany({})
    console.log("Cleared existing users")

    // Create seed users
    for (const userData of seedUsers) {
      const salt = await bcrypt.genSalt(10)
      userData.password = await bcrypt.hash(userData.password, salt)

      const user = new User(userData)
      await user.save()
      console.log(`Created user: ${user.name}`)
    }

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
