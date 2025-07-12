import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import swapRoutes from "./routes/swaps.js"
import adminRoutes from "./routes/admin.js"
import messageRoutes from "./routes/messages.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/swaps", swapRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/messages", messageRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/skillswap")
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })
