import jwt from "jsonwebtoken"
import User from "../models/User.js"
import dotenv from 'dotenv';
import bcrypt from "bcryptjs"
import express from "express"

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("✅ Decoded token:", decoded)

    const user = await User.findById(decoded.userId).select("-password")
    if (!user) {
      return res.status(401).json({ message: "Invalid token." })
    }

    console.log("✅ Authenticated user:", user.email)

    if (user.isBanned) {
      return res.status(403).json({ message: "Account has been banned." })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("❌ Auth error:", error.message)
    res.status(401).json({ message: "Invalid token." })
  }
}


export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." })
  }
  next()
}