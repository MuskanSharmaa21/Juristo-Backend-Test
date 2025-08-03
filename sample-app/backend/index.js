import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import cors from "cors";  
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const FormData = require("form-data");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",           
    methods: "*",          
    allowedHeaders: "*",    
}));

const upload = multer({ storage: multer.memoryStorage() });

const JURISTO_API_BASE_URL = process.env.JURISTO_API_BASE_URL || "http://localhost:5001";
const DEFAULT_API_KEY ="994daed69aea3bbd1d357cc7942564fb8533642f743a5366decc451f534ce817";

app.post("/chat", async (req, res) => {
    try {
      console.log("Received message:", req.body); 
  
      const { message, newChat, chatId, userId, country, language } = req.body;
  
      const defaultCountry = country || "India";  
      const defaultLanguage = language || "English";  
      const defaultChatId = chatId || `CID${Date.now()}`;
      const defaultUserId = userId || "defaultUser";
      const defaultNewChat = newChat || false;  
  
      const data = {
        message,
        newChat: defaultNewChat,
        chatId: defaultChatId,
        userId: defaultUserId,
        country: defaultCountry,
        language: defaultLanguage,
      };
  
      console.log("Sending data to original API:", data);
  
      const response = await axios.post(
        `${JURISTO_API_BASE_URL}/chat/?apiKey=${DEFAULT_API_KEY}`,
        data 
      );
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });
  
    

const documentCache = new Map();

app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();

    if (req.file) {
      formData.append("file", req.file.buffer, req.file.originalname);
    } else {
      return res.status(400).json({ error: "File is required." });
    }

    const response = await axios.post(
      `${JURISTO_API_BASE_URL}/document`,
      formData,
      {
        params: { apiKey: DEFAULT_API_KEY },
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const data = response.data;
    const documentId = data.data.documentId;
    const context = data.data.context;
    console.log("documentId:", documentId);
    console.log("context:", context);

    if (documentId && context) {
      documentCache.set(documentId, context); 
    }
    console.log("Document Cache after analyze:", Array.from(documentCache.entries()));


    res.json({ ...response.data, documentId });
  } catch (error) {
    console.error("Error in /analyze:", error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

  
  app.post("/query", async (req, res) => {
    try {
      const { question, documentId } = req.body;
  
      if (!documentId || !question) {
        return res.status(400).json({ error: "documentId and question are required." });
      }
  
      const context = documentCache.get(documentId);
      
      console.log("Incoming documentId:", documentId);
      console.log("Available document IDs in cache:", Array.from(documentCache.keys()));
      
      if (!context) {
        return res.status(404).json({ error: "No document context found for this documentId." });
      }
  
      const queryMessages = [
        {
          role: "system",
          content: "You are an assistant answering questions based on provided document context.",
        },
        {
          role: "user",
          content: `Context: ${context}`,
        },
        {
          role: "user",
          content: `Question: ${question}`,
        },
      ]

      queryMessages.push({question: question});
  
      const response = await axios.post(
        `${JURISTO_API_BASE_URL}/query`,
        { documentId, question },
        {
          params: { apiKey: DEFAULT_API_KEY },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("Error in /query:", error);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/drafting/questions", async (req, res) => {
    try {
      const { text, country } = req.body;

      const defaultText = text || "Generate me a legal document";
      const defaultCountry = country || "India";

  
      const response = await axios.post(`${JURISTO_API_BASE_URL}/drafting/questions`, {
        userInput: defaultText,
        country: defaultCountry,
      }, {
        params: { apiKey: DEFAULT_API_KEY },
      });
  
      res.json(response.data);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });
  
  app.post("/drafting/document", async (req, res) => {
    try {
      const { answers = [], prompt , country = 'India' } = req.body;
        const userInput = prompt || "Generate me a legal document based on these answers";
      console.log("Received answers:", answers);
  console.log("Received userInput:", req.body.prompt);
  
      const response = await axios.post(`${JURISTO_API_BASE_URL}/drafting/document`, {
        answers,
        userInput,
        country,
      }, {
        params: { apiKey: DEFAULT_API_KEY },
      });

      // testing code again, please leave commented outnu 
      // const encodedDocx = response.data.docx;
      // const decodedDocx = Buffer.from(encodedDocx, "base64");
      // fs.writeFileSync("decoded_legal.docx", decodedDocx);
  
      res.status(200).json({
        docx: response.data.docx,
        pdf: response.data.pdf,
      });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });
  
  

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Sample backend service is running." });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Sample backend service running on port ${PORT}`));
