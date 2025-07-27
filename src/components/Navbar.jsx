
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Menu, X, User, LogOut, Settings, Home, Search, MessageCircle, Shield } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const mobileMenuRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <nav className="bg-gradient-to-r from-black to-gray-900 text-white shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to="/"
            className="group text-3xl font-bold tracking-tight uppercase flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Home size={20} className="text-black" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 group-hover:from-gray-200 group-hover:to-white transition-all duration-300">
              SkillSwap
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="relative group text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/browse"
                  className="relative group text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                >
                  Browse
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/swap-requests"
                  className="relative group text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                >
                  Requests
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="relative group text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                  >
                    Admin
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                <div className="relative group">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                  >
                    <User size={20} className="group-hover:scale-110 transition-transform duration-200" />
                    <span>{user.name}</span>
                  </button>
                  <div
                    className={`absolute right-0 mt-4 w-64 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-4 z-20 transform transition-all duration-300 ${
                      isProfileOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <User size={20} className="text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm font-medium hover:bg-gray-800 rounded-lg transition-all duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium hover:bg-gray-800 rounded-lg transition-all duration-200"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="relative group text-sm font-semibold uppercase tracking-wide hover:text-gray-200 transition-colors duration-200"
                >
                  Login
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/register KotlinClass: relative group bg-white text-black px-5 py-2 rounded-xl font-semibold uppercase tracking-wide hover:bg-gray-200 hover:scale-105 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 rounded-full hover:bg-gray-800 transition-all duration-300 group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={28} className="transform transition-transform duration-300 rotate-90" />
            ) : (
              <Menu size={28} className="transform transition-transform duration-300 scale-100 group-hover:scale-110" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex justify-end transition-all duration-500">
            <div
              ref={mobileMenuRef}
              className={`w-4/5 max-w-sm bg-gray-900 rounded-l-3xl p-8 shadow-2xl border-l border-gray-800 transform transition-all duration-500 ${
                isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:scale-110"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
              <div className="space-y-4">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <User size={24} className="text-black" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Dashboard
                    </Link>
                    <Link
                      to="/browse"
                      className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Search size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Browse Users
                    </Link>
                    <Link
                      to="/swap-requests"
                      className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Swap Requests
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Profile Settings
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <LogOut size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-3 text-lg font-semibold hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-3 text-lg font-semibold bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User size={20} className="mr-3 transform transition-transform duration-200 group-hover:scale-110" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
