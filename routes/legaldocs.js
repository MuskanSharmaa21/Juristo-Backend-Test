import express from "express";
import {
  createDocument,
  getAllDocumentsByUserId,
  generateQuestions,
} from "../controllers/legaldocsController.js";
const router = express.Router();
import cors from "cors";
import { requestLimitMiddleware } from "../middlewares/requestLimiter.js";

router.use(cors());

router.post("/questions", requestLimitMiddleware, generateQuestions);
router.post("/generate", cors(), requestLimitMiddleware, createDocument);
router.get("/:userId", getAllDocumentsByUserId);

export default router;