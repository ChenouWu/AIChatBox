import express from "express";
import {auth} from "../middleware/auth.js";

import {
  listChats,
  getChat,
  createChat,
  addMessage,
  renameChat,
  deleteChat,
} from "../Controllers/ChatControllers.js";

const router = express.Router();

router.get("/", auth,listChats);         // 列表
router.get("/:id", auth,getChat);        // 详情
router.post("/", auth,createChat);       // 新建
router.post("/:id/messages", auth,addMessage); // 追加消息
router.patch("/:id",auth, renameChat);   // 重命名
router.delete("/:id", auth,deleteChat);  // 删除

export default router;
