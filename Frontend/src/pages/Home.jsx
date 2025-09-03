import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore" 
import { Send, Sparkles, MessageCircle, Lightbulb } from "lucide-react"

export default function Home() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const { user, fetchMe, loading,initialized } = useAuthStore()
  const {hasConversations,fetchChats} = useChatStore()
  const sendMessageToAI = useChatStore((state) => state.sendMessageToAI)

  useEffect(() => {
    fetchMe()
  
    console.log("Fetched user:", user)
  }, [fetchMe])
  
  useEffect(() => {
    if (initialized && !loading && !user) {
      (async () => {
        await fetchChats();
        if (hasConversations()) {
          navigate("/chat");
        }
      })
       // Go to Chat page;
    }
  }, [initialized,user, loading, fetchChats, hasConversations, navigate]);

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    await sendMessageToAI(message) 
    setMessage("")
    setIsLoading(false)
    navigate("/chat") // Go to Chat page
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const examplePrompts = [
    {
      icon: MessageCircle,
      title: "Start a Conversation",
      description: "Ask me anything",
      prompt: "Hi, I’d like to know more about...",
    },
    {
      icon: Lightbulb,
      title: "Creative Ideas",
      description: "Get inspiration and suggestions",
      prompt: "Give me some creative ideas about...",
    },
    {
      icon: Sparkles,
      title: "Problem Solving",
      description: "Seek help and advice",
      prompt: "I’m facing an issue and need some help...",
    },
  ]

  const handleExampleClick = (prompt) => {
    setMessage(prompt)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI ChatBox
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            I’m your smart assistant. I can answer questions, provide suggestions, and spark creativity. Let’s start chatting!
          </p>
        </div>

        {/* Example Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examplePrompts.map((example, index) => {
            const IconComponent = example.icon
            return (
              <div
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white/70 backdrop-blur-sm rounded-xl"
                onClick={() => handleExampleClick(example.prompt)}
              >
                <div className="p-6 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{example.title}</h3>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input Form */}
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question or idea..."
                className="w-full min-h-[120px] pr-16 resize-none border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent p-4"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute bottom-4 right-4 h-10 w-10 p-0 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Press Enter to send, Shift + Enter for a new line
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>The AI Assistant is always here to help you</p>
        </div>
      </div>
    </div>
  )
}
