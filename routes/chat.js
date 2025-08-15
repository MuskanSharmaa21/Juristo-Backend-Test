import express from "express";
import { deleteChat, findChatById, getAllChats, handleChat } from "../controllers/chatController.js";
import { requestLimitMiddleware } from "../middlewares/requestLimiter.js";

const router = express.Router();

router.post("/",requestLimitMiddleware, handleChat);
router.get("/:userId", getAllChats);
router.get("/:chatId", findChatById);
router.delete("/:chatId", deleteChat);

export default router;