"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 
                placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 transition 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 
                placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 transition 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md 
              hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Switch to Register */}
        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
