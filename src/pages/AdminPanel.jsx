"use client"

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

  // State for report management modal
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
    }
  }

  const unbanUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unban`)
      toast.success("User unbanned successfully")
      fetchAdminData()
    } catch (error) {
      console.error("Error unbanning user:", error)
    }
  }

  const sendPlatformMessage = async () => {
    try {
      await api.post("/admin/broadcast", { message })
      toast.success("Message sent to all users")
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
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
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("Error updating report status:", error)
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

  if (loading) {
    return <div className="text-center py-8">Loading admin panel...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200">
        {["overview", "users", "swaps", "reports"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 -mb-px border-b-2 text-lg font-medium transition-colors duration-200 ${
              activeTab === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <Users className="text-blue-600" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
              <p className="text-gray-600 text-sm">Total Users</p>
            </div>
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="text-green-600" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalSwaps}</h3>
              <p className="text-gray-600 text-sm">Total Swaps</p>
            </div>
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.pendingReports}</h3>
              <p className="text-gray-600 text-sm">Pending Reports</p>
            </div>
            <div className="card text-center p-6 flex flex-col items-center">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <User className="text-purple-600" size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeUsers}</h3>
              <p className="text-gray-600 text-sm">Active Users</p>
            </div>
          </div>

          {/* Platform Message */}
         <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
  <h2 className="text-2xl font-bold text-gray-800 mb-5">📢 Send Platform Message</h2>

  <div className="space-y-5">
    <textarea
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none p-4 text-sm resize-none transition duration-200"
      rows="5"
      placeholder="Write a message to broadcast to all users (e.g., '🎉 New feature launched! Check your updated profile')..."
    />

 <button
  onClick={sendPlatformMessage}
  disabled={!message.trim()}
  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-black text-white font-medium text-sm rounded-xl hover:bg-white hover:text-black border border-black disabled:opacity-50 transition-all duration-200"
>
  <MessageSquare size={18} className="mr-2" />
  Send Message
</button>

  </div>
</div>


          {/* Download Reports */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Download Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => downloadReport("users")}
                className="btn-secondary flex items-center justify-center px-4 py-2.5"
              >
                <Download size={16} className="mr-2" />
                User Activity
              </button>
              <button
                onClick={() => downloadReport("swaps")}
                className="btn-secondary flex items-center justify-center px-4 py-2.5"
              >
                <Download size={16} className="mr-2" />
                Swap Statistics
              </button>
              <button
                onClick={() => downloadReport("feedback")}
                className="btn-secondary flex items-center justify-center px-4 py-2.5"
              >
                <Download size={16} className="mr-2" />
                Feedback Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isBanned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanUser(user._id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(user._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <Ban size={14} className="inline mr-1" />
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
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Swap Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Participants</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Message</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map((swap) => (
                  <tr key={swap._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {swap.requester?.name || "N/A"} ↔ {swap.target?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{new Date(swap.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">
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
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Reports & Issues</h2>
          {reports.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <FileText size={48} className="text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 font-semibold mb-2">No reports found.</p>
              <p className="text-gray-500 max-w-md">All clear! There are no pending or active reports at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        **Reported by:** {report.reporter?.name || "N/A"} on{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      {report.reportedUser && (
                        <p className="text-sm text-gray-600">**Reported User:** {report.reportedUser.name}</p>
                      )}
                      <p className="text-gray-700 mt-2 text-sm">{report.description}</p>
                      {report.adminNotes && (
                        <p className="text-sm text-gray-500 mt-2 italic">**Admin Notes:** {report.adminNotes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      {(report.status === "pending" || report.status === "investigating") && (
                        <button
                          onClick={() => handleReportAction(report)}
                          className="btn-secondary text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">Manage Report</h3>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setSelectedReport(null)
                  setAdminNotes("")
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-base text-gray-800 font-semibold">{selectedReport.title}</p>
              <p className="text-sm text-gray-600">**Reported by:** {selectedReport.reporter?.name || "N/A"}</p>
              {selectedReport.reportedUser && (
                <p className="text-sm text-gray-600">**Reported User:** {selectedReport.reportedUser.name}</p>
              )}
              <p className="text-gray-700 mt-3">{selectedReport.description}</p>
            </div>

            <div className="mb-4">
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Add notes about this report, e.g., 'User warned', 'Content removed'..."
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={() => updateReportStatus("resolved")}
                className="btn-primary flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center px-4 py-2.5"
              >
                <CheckCircle size={18} className="mr-2" />
                Resolve Report
              </button>
              <button
                onClick={() => updateReportStatus("dismissed")}
                className="btn-secondary flex-1 bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center px-4 py-2.5"
              >
                <XCircle size={18} className="mr-2" />
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
