
import { useEffect, useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function Chat() {
  const [message, setMessage] = useState("")
  const messages = useChatStore((s) => s.messages)
  const sendMessageToAI = useChatStore((s) => s.sendMessageToAI)
  const { user, fetchMe, loading,initialized } = useAuthStore()
  const navigate = useNavigate()


  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    if (initialized && !loading && !user) {
      navigate("/login")
    }
  }, [initialized,user, loading, navigate])


  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  const handleSend = async () => {
    const text = message.trim()
    if (!text) return
    await sendMessageToAI(text)
    setMessage("")
    // 重置 textarea 高度
    if (taRef.current) {
      taRef.current.style.height = "auto"
    }
  }

  // textarea 自动增高
  const taRef = useRef(null)
  const handleInput = (e) => {
    setMessage(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  // Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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

        {/* 消息区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm max-w-[70%] md:max-w-[65%] break-words
                ${msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 dark:text-gray-100"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-end gap-2 border border-gray-300 dark:border-gray-700 rounded-lg p-2 shadow-md bg-white dark:bg-gray-900">
            <textarea
              ref={taRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…  (Enter to send • Shift+Enter for newline)"
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm max-h-60"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
