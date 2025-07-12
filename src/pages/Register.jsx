import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      toast.success("Registration successful!")
      navigate("/dashboard")
    } catch (err) {
      console.error("Registration error:", err)
      toast.error("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 
                placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 
                placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500 transition"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 
                placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500 transition"
            />
          </div>

          {/* Password */}
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
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white 
                dark:placeholder-gray-500 transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={`w-full px-3 py-2 text-sm rounded-md border ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              } placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
              focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white 
              dark:placeholder-gray-500 transition`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md 
              hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
