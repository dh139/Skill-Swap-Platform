import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "An error occurred"
    toast.error(message)
    return Promise.reject(error)
  },
)

export default api
