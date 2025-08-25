import { useState } from "react"
import { useChatStore } from "../store/useChatStore"
import Sidebar from "../components/Sidebar"
import { useEffect } from "react"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"

export default function Chat() {
  const [message, setMessage] = useState("")
  const messages = useChatStore((state) => state.messages)
  const sendMessageToAI = useChatStore((state) => state.sendMessageToAI)
  const { user, fetchMe, loading } = useAuthStore()
  const navigate = useNavigate()

    useEffect(()=>{
      fetchMe()
    },[fetchMe]
    )
  
    useEffect(() => {
      if (!loading && !user) {
        navigate("/login")
      }
    }, [user, loading, navigate])

  const handleSend = async () => {
    if (!message.trim()) return
    await sendMessageToAI(message)
    setMessage("")
  }

  

  return (
    <div className="flex h-screen">
      {/* 左侧 Sidebar */}
      <Sidebar />

      {/* 右侧聊天区 */}
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-black text-black dark:text-white">
        
        {/* 顶部标题 */}
        <h1 className="text-xl font-bold p-4 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
          Chat Page
        </h1>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-xs break-words text-xl ${
              msg.sender === "user"
                ? "bg-blue-600 text-white self-end ml-auto"
                : "bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
        {msg.text}
      </div>
    ))}
  </div>


        {/* 输入框（固定底部） */}
        <div className="flex-shrink-5 p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg p-2 shadow-md">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
