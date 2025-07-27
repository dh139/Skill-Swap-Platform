"use client"

import { useEffect, useState, useRef } from "react"
import api from "../services/api"
import { X, Send, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react"

const ChatModal = ({ swapId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && swapId) {
      fetchMessages()
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, swapId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${swapId}`)
      setMessages(res.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    const tempMessage = {
      _id: Date.now(),
      content: newMessage,
      sender: { name: "You" },
      createdAt: new Date().toISOString(),
      isTemp: true
    }
    
    setMessages(prev => [...prev, tempMessage])
    const messageToSend = newMessage
    setNewMessage("")
    
    try {
      const res = await api.post("/messages", { swapId, content: messageToSend })
      setMessages(prev => prev.map(msg => 
        msg.isTemp ? res.data : msg
      ))
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp))
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Chat Container */}
      <div className="absolute inset-4 md:inset-8 lg:inset-16 xl:inset-24 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">SW</span>
            </div>
            <div>
              <h3 className="font-semibold">Swap Chat</h3>
              <p className="text-sm text-white/70">Online now</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <Phone size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <Video size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:block"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Send size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender.name === "You"
              const showAvatar = index === 0 || messages[index - 1]?.sender.name !== msg.sender.name
              
              return (
                <div
                  key={msg._id}
                  className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                    {isCurrentUser ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {msg.sender.name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {msg.sender.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showAvatar && !isCurrentUser && (
                      <span className="text-xs text-gray-500 mb-1 px-3">
                        {msg.sender.name}
                      </span>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                      } ${msg.isTemp ? 'opacity-70' : ''}`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    
                    <span className={`text-xs text-gray-400 mt-1 px-3 ${isCurrentUser ? 'text-right' : ''}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          
          {isTyping && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">•••</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm leading-relaxed max-h-32"
                placeholder="Type a message..."
                rows={1}
                style={{
                  minHeight: '44px',
                  height: 'auto'
                }}
              />
              
              {/* Character count or other indicators can go here */}
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                newMessage.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl scale-100'
                  : 'bg-gray-200 text-gray-400 scale-95'
              }`}
            >
              <Send size={18} className={newMessage.trim() ? 'translate-x-0.5' : ''} />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-gray-400">
              Press Enter to send, Shift + Enter for new line
            </p>
            {newMessage.length > 0 && (
              <p className="text-xs text-gray-400">
                {newMessage.length}/500
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatModal