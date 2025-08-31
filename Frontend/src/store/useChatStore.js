import { create } from "zustand";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    // 忽略非 JSON 的情况
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const useChatStore = create((set, get) => ({
  chats: [],                 // 会话列表（Sidebar 用）
  currentChatId: null,       // 当前打开的会话
  messages: [],              // 当前会话的消息
  loading: false,
  error: null,
  isResponding: false,       

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchJson(`${API}/api/chats`, { credentials: "include" });
      const items = Array.isArray(data) ? data : data.items;
      set({ chats: items || [] });

      if (!get().currentChatId && items?.[0]) {
        await get().openChat(items[0]._id);
      }
    } catch (e) {
      set({ error: e.message || "Failed to load chats" });
    } finally {
      set({ loading: false });
    }
  },

  newChat: async (title = "New chat") => {
    try {
      const chat = await fetchJson(`${API}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      set((s) => ({
        chats: [chat, ...s.chats.filter(c => c._id !== chat._id)],
        currentChatId: chat._id,
        messages: [],
      }));
      return chat._id;
    } catch (e) {
      set({ error: e.message || "Failed to create chat" });
      throw e;
    }
  },

  openChat: async (chatId) => {
    set({ loading: true, error: null });
    try {
      const chat = await fetchJson(`${API}/api/chats/${chatId}`, { credentials: "include" });
      // 兼容后端可能返回 { messages, ... } 或分页字段
      const messages = chat.messages || chat.items || [];
      set({ currentChatId: chatId, messages });
    } catch (e) {
      set({ error: e.message || "Failed to open chat" });
      // 打不开可能被删了，尝试刷新列表
      await get().fetchChats();
    } finally {
      set({ loading: false });
    }
  },

  renameChat: async (chatId, title) => {
    try {
      const updated = await fetchJson(`${API}/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      set((s) => ({
        chats: s.chats.map((c) => (c._id === chatId ? { ...c, title: updated.title } : c)),
      }));
    } catch (e) {
      set({ error: e.message || "Failed to rename chat" });
      throw e;
    }
  },

  deleteChat: async (chatId) => {
    try {
      await fetchJson(`${API}/api/chats/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const state = get();
      const nextChats = state.chats.filter((c) => c._id !== chatId);
      const nextId = state.currentChatId === chatId ? (nextChats[0]?._id || null) : state.currentChatId;

      set({
        chats: nextChats,
        currentChatId: nextId,
        messages: nextId ? state.messages : [],
      });

      if (nextId) {
        await get().openChat(nextId);
      } else {
        set({ messages: [] });
      }
    } catch (e) {
      set({ error: e.message || "Failed to delete chat" });
      throw e;
    }
  },

  // === 发送消息：自动创建会话 -> 保存用户消息 -> 调 OpenAI -> 保存 AI 消息 ===
  sendMessageToAI: async (userMessage) => {
    const state = get();
    let chatId = state.currentChatId;

    // 没有会话就创建一个（用首句作为临时标题）
    if (!chatId) {
      chatId = await get().newChat(userMessage.slice(0, 40));
    }

    // 1) 先乐观添加用户消息 + 落库
    const userMsg = { id: `u-${Date.now()}`, sender: "user", text: userMessage };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    try {
      await fetchJson(`${API}/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sender: "user", text: userMessage }),
      });
    } catch (e) {
      // 回滚乐观消息
      set((s) => ({ messages: s.messages.filter((m) => m !== userMsg) }));
      set({ error: e.message || "Failed to send message" });
      throw e;
    }

    // 2) 调 OpenAI 获取回复（⚠️ 生产建议移到后端，避免暴露 Key）
    set({ isResponding: true });
    let replyText = "…";
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `OpenAI error: ${res.status}`;
        throw new Error(msg);
      }
      replyText = data?.choices?.[0]?.message?.content || "…";
    } catch (e) {
      // 给一个错误提示泡泡
      replyText = `⚠️ ${e.message || "AI reply failed"}`;
      set({ error: e.message || "AI reply failed" });
    }

    // 3) 保存 AI 消息到后端，并更新本地
    const aiMsg = { id: `a-${Date.now()}`, sender: "ai", text: replyText };
    set((s) => ({ messages: [...s.messages, aiMsg] }));

    try {
      await fetchJson(`${API}/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sender: "ai", text: replyText }),
      });
    } catch (e) {
    
      set({ error: e.message || "Failed to persist AI message" });
    } finally {
      set({ isResponding: false });
    }
  },

  //checking if user has conversations
 hasConversations: () => {
  const { chats } = get();   // 从 zustand 里取 chats
  return chats.length > 0;
},

}));
