import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";

function Sidebar() {
  const messages = useChatStore((state) => state.messages);
  const [collapsed, setCollapsed] = useState(false);

    
  const chatTitle =
    messages.length > 0
      ? messages[0].text.slice(0, 20) + (messages[0].text.length > 20 ? "..." : "")
      : "New Chat";

  return (
    <div
      className={`h-screen border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Chats
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* 会话标题 */}
      <div
        className={`p-3 rounded-md bg-gray-100 dark:bg-gray-800 text-2xl text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
          collapsed ? "text-center" : ""
        }`}
      >
        {collapsed ? "💬" : chatTitle}
      </div>
    </div>
  );
}

export default Sidebar;
