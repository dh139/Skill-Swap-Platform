
import { useState, useEffect } from "react"
import api from "../services/api"
import { Users, MessageSquare, Ban, Download, AlertTriangle, CheckCircle, XCircle, User, FileText } from "lucide-react"
import toast from "react-hot-toast"

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSwaps: 0,
    pendingReports: 0,
    activeUsers: 0,
  })
  const [users, setUsers] = useState([])
  const [swaps, setSwaps] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReportStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "investigating":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "dismissed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, swapsRes, reportsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/swaps"),
        api.get("/admin/reports"),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setSwaps(swapsRes.data)
      setReports(reportsRes.data)
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const banUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/ban`)
      toast.success("User banned successfully")
      fetchAdminData()
    } catch (error) {
      console.error("Error banning user:", error)
      toast.error("Failed to ban user")
    }
  }

  const unbanUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unban`)
      toast.success("User unbanned successfully")
      fetchAdminData()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast.error("Failed to unban user")
    }
  }

  const sendPlatformMessage = async () => {
    try {
      await api.post("/admin/broadcast", { message })
      toast.success("Message sent to all users")
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/${type}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${type}-report.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Failed to download report")
    }
  }

  const handleReportAction = (report) => {
    setSelectedReport(report)
    setAdminNotes(report.adminNotes || "")
    setShowReportModal(true)
  }

  const updateReportStatus = async (status) => {
    try {
      await api.put(`/admin/reports/${selectedReport._id}/status`, { status, adminNotes })
      toast.success(`Report marked as ${status}`)
      setShowReportModal(false)
      setSelectedReport(null)
      setAdminNotes("")
      fetchAdminData()
    } catch (error) {
      console.error("Error updating report status:", error)
      toast.error("Failed to update report status")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Admin Panel...</h2>
          <p className="text-gray-600">Preparing your admin dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-bold text-gray-900 mb-12 tracking-tight uppercase">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-12 border-b border-gray-200">
        {["overview", "users", "swaps", "reports"].map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-3 text-lg font-semibold uppercase tracking-wide transition-all duration-300 ${
              activeTab === tab
                ? "text-white bg-black rounded-t-xl"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-t-xl"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span
              className={`absolute bottom-0 left-0 w-0 h-1 bg-white transition-all duration-300 ${
                activeTab === tab ? "w-full" : "group-hover:w-full"
              }`}
            ></span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { icon: Users, value: stats.totalUsers, label: "Total Users", color: "blue" },
              { icon: MessageSquare, value: stats.totalSwaps, label: "Total Swaps", color: "green" },
              { icon: AlertTriangle, value: stats.pendingReports, label: "Pending Reports", color: "yellow" },
              { icon: User, value: stats.activeUsers, label: "Active Users", color: "purple" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ animation: `fadeIn 0.5s ease-out ${index * 100}ms forwards`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-4 rounded-2xl bg-${stat.color}-100 text-${stat.color}-600 hover:bg-${stat.color}-200 transition-all duration-200`}
                  >
                    <stat.icon size={28} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Platform Message */}
          <div className="bg-gradient-to-br from-black to-gray-900 text-white rounded-3xl p-8 shadow-2xl border border-gray-800">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-4 bg-white/20 rounded-2xl">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-3xl font-bold">Send Platform Message</h2>
            </div>
            <div className="space-y-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 resize-none"
                rows="5"
                placeholder="Write a message to broadcast to all users (e.g., '🎉 New feature launched! Check your updated profile')..."
              />
              <button
                onClick={sendPlatformMessage}
                disabled={!message.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-white text-black font-semibold uppercase tracking-wide rounded-xl hover:bg-gray-200 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare size={20} className="mr-3" />
                Send Message
              </button>
            </div>
          </div>

          {/* Download Reports */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Download Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: "users", label: "User Activity" },
                { type: "swaps", label: "Swap Statistics" },
                { type: "feedback", label: "Feedback Logs" },
              ].map((report, index) => (
                <button
                  key={report.type}
                  onClick={() => downloadReport(report.type)}
                  className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-black hover:text-white hover:scale-105 transition-all duration-300"
                  style={{ animation: `fadeIn 0.5s ease-out ${index * 100}ms forwards`, opacity: 0 }}
                >
                  <Download size={20} className="mr-3" />
                  {report.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Name</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Email</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Joined</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                    style={{ animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}
                  >
                    <td className="py-4 px-6 text-gray-800 font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{user.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanUser(user._id)}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:scale-105 transition-all duration-200"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(user._id)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:scale-105 transition-all duration-200"
                        >
                          <Ban size={16} className="mr-2" />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Swaps Tab */}
      {activeTab === "swaps" && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Swap Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Participants</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Created</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 uppercase">Message</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map((swap, index) => (
                  <tr
                    key={swap._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                    style={{ animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}
                  >
                    <td className="py-4 px-6 text-gray-800 font-medium">
                      {swap.requester?.name || "N/A"} ↔ {swap.target?.name || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-700 text-sm max-w-xs truncate">
                      {swap.message || "No message"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Reports & Issues</h2>
          {reports.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <FileText size={64} className="text-gray-400 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Reports Found</h3>
              <p className="text-gray-600 max-w-md leading-relaxed">
                All clear! There are no pending or active reports at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                  style={{ animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Reported by:</span> {report.reporter?.name || "N/A"} on{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      {report.reportedUser && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reported User:</span> {report.reportedUser.name}
                        </p>
                      )}
                      <p className="text-gray-700 mt-3 text-sm leading-relaxed">{report.description}</p>
                      {report.adminNotes && (
                        <p className="text-sm text-gray-500 mt-3 italic">
                          <span className="font-medium">Admin Notes:</span> {report.adminNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      {(report.status === "pending" || report.status === "investigating") && (
                        <button
                          onClick={() => handleReportAction(report)}
                          className="px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200"
                        >
                          Manage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Management Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-lg mx-auto shadow-2xl border border-gray-100 transform transition-all duration-300 scale-95"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Manage Report</h3>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setSelectedReport(null)
                  setAdminNotes("")
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <XCircle size={28} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-lg font-semibold text-gray-900">{selectedReport.title}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reported by:</span> {selectedReport.reporter?.name || "N/A"}
              </p>
              {selectedReport.reportedUser && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reported User:</span> {selectedReport.reportedUser.name}
                </p>
              )}
              <p className="text-gray-700 text-sm leading-relaxed">{selectedReport.description}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="adminNotes" className="block text-sm font-semibold text-gray-900 uppercase mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                rows="4"
                placeholder="Add notes about this report, e.g., 'User warned', 'Content removed'..."
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => updateReportStatus("resolved")}
                className="flex-1 bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <CheckCircle size={20} className="mr-2" />
                Resolve Report
              </button>
              <button
                onClick={() => updateReportStatus("dismissed")}
                className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <XCircle size={20} className="mr-2" />
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default AdminPanel
