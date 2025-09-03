import Conversation from "../Schemas/Chat.js";

/** GET /api/chats  */
export async function listChats(req, res) {
  const userId = req.auth.uid;
  const chats = await Conversation.find({ userId })
    .select("_id title lastMessageAt createdAt")
    .sort({ lastMessageAt: -1 });
  res.json(chats);
}

/** GET /api/chats/:id */
export async function getChat(req, res) {
  const userId = req.auth.uid;
  const { id } = req.params;
  const chat = await Conversation.findOne({ _id: id, userId });
  if (!chat) return res.status(404).json({ error: "Not found" });
  res.json(chat);
}

/** POST /api/chats   */
export async function createChat(req, res) {
  const userId = req.auth.uid;
  const { title } = req.body || {};
  const chat = await Conversation.create({
    userId,
    title: (title && String(title).slice(0, 80)) || "New chat",
    messages: [],
    lastMessageAt: new Date(),
  });
  res.json(chat);
}

/** POST /api/chats/:id/messages   */
export async function addMessage(req, res) {
  const userId = req.auth.uid;
  const { id } = req.params;
  const { sender, text } = req.body || {};
  if (!sender || !text) return res.status(400).json({ error: "sender/text required" });
  if (!["user", "ai"].includes(sender)) return res.status(400).json({ error: "invalid sender" });

  const chat = await Conversation.findOneAndUpdate(
    { _id: id, userId },
    {
      $push: { messages: { sender, text } },
      $set: { lastMessageAt: new Date() },
    },
    { new: true }
  );
  if (!chat) return res.status(404).json({ error: "Not found" });

 
  if (!chat.title || chat.title === "New chat") {
    const firstUserMsg = chat.messages.find((m) => m.sender === "user");
    if (firstUserMsg) {
      chat.title = firstUserMsg.text.slice(0, 40);
      await chat.save();
    }
  }

  res.json(chat);
}

/** PATCH /api/chats/:id   */
export async function renameChat(req, res) {
  const userId = req.auth.uid;
  const { id } = req.params;
  const { title } = req.body || {};
  const chat = await Conversation.findOneAndUpdate(
    { _id: id, userId },
    { $set: { title: String(title || "").slice(0, 80) } },
    { new: true }
  );
  if (!chat) return res.status(404).json({ error: "Not found" });
  res.json(chat);
}

/** DELETE /api/chats/:id   */
export async function deleteChat(req, res) {
  const userId = req.auth.uid;
  const { id } = req.params;
  const result = await Conversation.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}
