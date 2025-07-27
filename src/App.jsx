import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Browse from "./pages/Browse"
import SwapRequests from "./pages/SwapRequests"
import AdminPanel from "./pages/AdminPanel"
import LoadingSpinner from "./components/LoadingSpinner"
import UserProfile from "./pages/Profile"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/browse" element={user ? <Browse /> : <Navigate to="/login" />} />
            <Route path="/swap-requests" element={user ? <SwapRequests /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === "admin" ? <AdminPanel /> : <Navigate to="/dashboard" />} />
            <Route path="/user/:id" element={user ? <UserProfile /> : <Navigate to="/login" />} />
         

          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
