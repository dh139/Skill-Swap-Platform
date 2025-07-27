
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { Loader2, Eye, EyeOff, XCircle } from "lucide-react"
import api from "../services/api"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [forgotPassword, setForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: Email, 2: OTP, 3: New Password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData((prev) => ({
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
      toast.error(error.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (forgotPasswordStep === 1) {
        // Step 1: Request OTP
        await api.post("/auth/forgot-password", { email: forgotPasswordData.email })
        toast.success("OTP sent to your email!")
        setForgotPasswordStep(2)
      } else if (forgotPasswordStep === 2) {
        // Step 2: Verify OTP
        await api.post("/auth/verify-otp", {
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
        })
        toast.success("OTP verified!")
        setForgotPasswordStep(3)
      } else if (forgotPasswordStep === 3) {
        // Step 3: Reset Password
        if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
          toast.error("Passwords do not match")
          setLoading(false)
          return
        }
        await api.post("/auth/reset-password", {
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
          newPassword: forgotPasswordData.newPassword,
        })
        toast.success("Password reset successfully! Please log in.")
        setForgotPassword(false)
        setForgotPasswordStep(1)
        setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" })
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 transition-all duration-500">
        {!forgotPassword ? (
          <>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 text-center tracking-tight uppercase">
              Welcome Back
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
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
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
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
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition-all duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setForgotPassword(true)}
                  className="text-sm font-medium text-gray-600 hover:text-black underline underline-offset-4 transition-all duration-200"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Link to Register */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="underline underline-offset-4 hover:text-black transition-all duration-200">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 text-center tracking-tight uppercase">
              Reset Password
            </h2>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              {forgotPasswordStep === 1 && (
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="email"
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  />
                </div>
              )}
              {forgotPasswordStep === 2 && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
                    OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={forgotPasswordData.otp}
                    onChange={handleForgotPasswordChange}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  />
                </div>
              )}
              {forgotPasswordStep === 3 && (
                <>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition-all duration-200"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={forgotPasswordData.confirmPassword}
                        onChange={handleForgotPasswordChange}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black transition-all duration-200"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-800 hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                    {forgotPasswordStep === 1 ? "Sending OTP..." : forgotPasswordStep === 2 ? "Verifying OTP..." : "Resetting Password..."}
                  </>
                ) : (
                  forgotPasswordStep === 1 ? "Send OTP" : forgotPasswordStep === 2 ? "Verify OTP" : "Reset Password"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <p className="text-center mt-6 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false)
                  setForgotPasswordStep(1)
                  setForgotPasswordData({ email: "", otp: "", newPassword: "", confirmPassword: "" })
                }}
                className="underline underline-offset-4 hover:text-black transition-all duration-200"
              >
                Back to Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Login
