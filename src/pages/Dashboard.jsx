
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"
import { 
  Edit, 
  Star, 
  Clock, 
  Users, 
  MessageSquare, 
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Activity,
  Zap,
  Target,
  Award,
  ChevronRight,
  Bell,
  Settings,
  Plus,
  X
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const ProfileCompletionModal = ({ isOpen, onClose, onCompleteProfile }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Edit size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Add your skills, bio, and location to connect with others and start swapping expertise!
          </p>
          <button
            onClick={onCompleteProfile}
            className="w-full bg-black text-white py-4 px-6 rounded-2xl font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Edit size={20} />
            <span>Update Profile Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSwaps: 0,
    pendingRequests: 0,
    completedSwaps: 0,
    averageRating: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [platformMessages, setPlatformMessages] = useState([])
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Check if profile is incomplete
  const isProfileIncomplete = !user?.bio || !user?.skillsOffered?.length || !user?.skillsWanted?.length

  useEffect(() => {
    if (isProfileIncomplete) {
      setShowProfileModal(true) // Show modal for first-time users
      // Optional: Redirect instead of showing modal
      // navigate("/profile")
    }
    fetchDashboardData()
    fetchPlatformMessages()
  }, [isProfileIncomplete])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([api.get("/users/stats"), api.get("/swaps/recent")])
      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformMessages = async () => {
    try {
      const response = await api.get("/platform-messages/latest")
      setPlatformMessages(response.data)
    } catch (error) {
      console.error("Error fetching platform messages:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your dashboard...</h2>
          <p className="text-gray-600">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, value, label, trend, color = "black", delay = 0 }) => (
    <div 
      className={`group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-500 hover:scale-[1.02] ${
        hoveredCard === label ? 'ring-2 ring-black/10' : ''
      }`}
      onMouseEnter={() => setHoveredCard(label)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl transition-all duration-300 ${
          color === 'black' ? 'bg-black text-white group-hover:bg-gray-800' :
          color === 'gray' ? 'bg-gray-100 text-gray-700 group-hover:bg-gray-200' :
          'bg-gray-50 text-gray-600 group-hover:bg-gray-100'
        }`}>
          <Icon size={28} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
            <TrendingUp size={16} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
          {typeof value === 'number' && value > 0 ? value : value || '0'}
        </h3>
        <p className="text-gray-600 font-medium">{label}</p>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
    </div>
  )

  const QuickActionCard = ({ icon: Icon, title, description, onClick, primary = false }) => (
    <button
      onClick={onClick}
      className={`group relative p-8 rounded-3xl text-left transition-all duration-300 hover:scale-[1.02] ${
        primary 
          ? 'bg-black text-white hover:bg-gray-800 shadow-2xl shadow-black/20' 
          : 'bg-white border-2 border-gray-100 hover:border-black hover:shadow-xl'
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl transition-all duration-300 ${
          primary 
            ? 'bg-white/20 text-white' 
            : 'bg-gray-100 text-gray-700 group-hover:bg-black group-hover:text-white'
        }`}>
          <Icon size={24} />
        </div>
        <ArrowUpRight size={20} className={`transition-all duration-300 ${
          primary ? 'text-white/70' : 'text-gray-400 group-hover:text-black'
        } group-hover:translate-x-1 group-hover:-translate-y-1`} />
      </div>
      
      <div className="space-y-3">
        <h3 className={`text-xl font-bold ${primary ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${
          primary ? ']?text-white/80' : 'text-gray-600'
        }`}>
          {description}
        </p>
      </div>
    </button>
  )

  const ActivityItem = ({ activity, index }) => (
    <div 
      className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-black rounded-full"></div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-black">
            {activity.title}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {activity.description}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm text-gray-500 font-medium">
          {activity.date}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                Welcome back,
                <span className="block text-black">{user.name}</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Track your progress, manage connections, and discover new opportunities in your skill-swapping journey
              </p>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              {/* Add notification and settings buttons if needed */}
            </div>
          </div>
        </div>

        {/* Profile Completion Modal */}
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onCompleteProfile={() => navigate("/profile")}
        />

        {/* Platform Announcements */}
        {platformMessages.length > 0 && (
          <div className="bg-gradient-to-br from-black to-gray-800 rounded-3xl p-8 mb-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">Platform Announcements</h2>
              </div>
              
              <div className="space-y-4">
                {platformMessages.map((msg, index) => (
                  <div 
                    key={msg._id} 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <p className="text-white font-medium mb-3 leading-relaxed">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between text-white/70 text-sm">
                      <span>Sent by {msg.sentBy?.name || "Admin"}</span>
                      <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          <StatCard 
            icon={Users} 
            value={stats.totalSwaps} 
            label="Total Swaps" 
            color="black"
            delay={0}
          />
          <StatCard 
            icon={Clock} 
            value={stats.pendingRequests} 
            label="Pending Requests" 
            color="gray"
            delay={100}
          />
          <StatCard 
            icon={Target} 
            value={stats.completedSwaps} 
            label="Completed Swaps" 
            color="black"
            delay={200}
          />
          <StatCard 
            icon={Star} 
            value={stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"} 
            label="Average Rating" 
            color="gray"
            delay={300}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Quick Actions</h2>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200">
              <span className="font-medium">View All</span>
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <QuickActionCard
              icon={Edit}
              title="Update Profile"
              description="Add new skills, update your availability, and enhance your profile to attract better matches"
              onClick={() => navigate("/profile")}
              primary={true}
            />
            <QuickActionCard
              icon={Users}
              title="Browse Users"
              description="Discover talented individuals and find the perfect skill exchange partners"
              onClick={() => navigate("/browse")}
            />
            <QuickActionCard
              icon={Clock}
              title="Manage Requests"
              description="Review pending requests, accept new opportunities, and track your progress"
              onClick={() => navigate("/swap-requests")}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black rounded-2xl">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-gray-600">Stay updated with your latest interactions</p>
              </div>
            </div>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                No recent activity yet. Start your skill-swapping journey by exploring users or updating your profile!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate("/browse")}
                  className="px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Users size={20} />
                  <span>Browse Users</span>
                </button>
                <button 
                  onClick={() => navigate("/profile")}
                  className="px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-black text-gray-900 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Edit size={20} />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
