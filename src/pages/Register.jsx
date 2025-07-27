import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

import { Eye, EyeOff, Loader2 } from "lucide-react" // 👈 already used in other components



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

const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-white/10 backdrop-blur-md border border-gray-100 dark:border-white/10 shadow-xl rounded-3xl p-8 transition-all duration-500">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-6 tracking-tight">
          Create Account
        </h2>

  <form onSubmit={handleSubmit} className="space-y-5">
  {[
    { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
    { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
    { label: "Location (Optional)", name: "location", type: "text", placeholder: "City, State" },
  ].map(({ label, name, type, placeholder }) => (
    <div key={name}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={name !== "location"}
        className="w-full px-4 py-2 text-sm rounded-xl border border-gray-300 ring-gray-300
          placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300
          focus:ring-black dark:bg-black dark:text-white dark:placeholder-gray-500 dark:border-white/10"
      />
    </div>
  ))}

  {/* Password Field with Toggle */}
  <div>
    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      Password
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        required
        className="w-full px-4 py-2 text-sm rounded-xl border border-gray-300 ring-gray-300
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300
          dark:bg-black dark:text-white dark:placeholder-gray-500 dark:border-white/10 pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-black dark:hover:text-white transition"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>

  {/* Confirm Password Field with Toggle */}
  <div>
    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      Confirm Password
    </label>
    <div className="relative">
      <input
        type={showConfirmPassword ? "text" : "password"}
        id="confirmPassword"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        required
        className={`w-full px-4 py-2 text-sm rounded-xl border ${
          error ? "border-red-500 ring-red-500" : "border-gray-300 ring-gray-300"
        } placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300
        focus:ring-black dark:bg-black dark:text-white dark:placeholder-gray-500 dark:border-white/10 pr-10`}
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-black dark:hover:text-white transition"
        tabIndex={-1}
      >
        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-black text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center"
  >
    {loading ? (
      <>
        <Loader2 className="animate-spin w-4 h-4 mr-2" />
        Creating Account...
      </>
    ) : (
      "Create Account"
    )}
  </button>
</form>


        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-700 dark:text-white/80">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-2 hover:text-black dark:hover:text-white transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
