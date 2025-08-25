import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  sendMessageToAI: async (userMessage) => {
    // 先添加用户消息
    set((state) => ({
      messages: [...state.messages, { id: Date.now(), sender: "user", text: userMessage }],
    }));

    // 调用 ChatGPT API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 轻量模型
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices[0].message.content;

    // 添加 AI 回复
    set((state) => ({
      messages: [...state.messages, { id: Date.now(), sender: "ai", text: reply }],
    }));
  },
}));
