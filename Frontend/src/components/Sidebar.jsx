import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";

export default function Sidebar() {
  const {
    chats,              
    currentChatId,
    fetchChats,         
    openChat,           
    newChat,              
    deleteChat,         
    renameChat,        
    loading,
    error,
  } = useChatStore();

  const [collapsed, setCollapsed] = useState(false);

  
  useEffect(() => {
    fetchChats();
  }, []);

  const handleNew = async () => {
    const id = await newChat("New chat");
    await openChat(id);
  };

  const handleRename = async (id, oldTitle) => {
    const title = window.prompt("Rename chat", oldTitle || "Untitled");
    if (title && title.trim()) await renameChat(id, title.trim());
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this chat?")) await deleteChat(id);
  };

  return (
    <aside
      className={`h-screen border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
    
      <div className="flex items-center justify-between mb-3">
        {!collapsed && <h2 className="text-lg font-bold">Chats</h2>}
        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              onClick={handleNew}
              className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              + New
            </button>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>
      </div>

      {!collapsed && error && (
        <div className="mb-2 text-xs text-red-500">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1">
        {loading && (
          <div className={`text-sm text-gray-500 ${collapsed ? "text-center" : ""}`}>
            Loading…
          </div>
        )}

        {!loading && chats.length === 0 && !collapsed && (
          <button
            onClick={handleNew}
            className="w-full text-left text-sm rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600"
          >
            Start your first chat →
          </button>
        )}

        {chats.map((c) => {
          const active = c._id === currentChatId;
          const title = c.title || "Untitled";
          return (
            <div
              key={c._id}
              className={`group flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer ${
                active ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => openChat(c._id)}
              title={collapsed ? title : undefined}
            >
              <div className={`w-2 h-2 rounded-full ${active ? "bg-blue-600" : "bg-gray-400"}`} />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{title}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                    <button
                      className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(c._id, title);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c._id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
