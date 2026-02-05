import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using Replit integration env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Conversations
  app.get(api.conversations.list.path, async (req, res) => {
    const conversations = await storage.getConversations();
    res.json(conversations);
  });

  app.post(api.conversations.create.path, async (req, res) => {
    const input = api.conversations.create.input.parse(req.body);
    const conversation = await storage.createConversation(input.title || "New Chat");
    res.status(201).json(conversation);
  });

  app.get(api.conversations.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const conversation = await storage.getConversation(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const messages = await storage.getMessages(id);
    res.json({ ...conversation, messages });
  });

  app.delete(api.conversations.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteConversation(id);
    res.status(204).send();
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    const input = api.settings.update.input.parse(req.body);
    const settings = await storage.updateSettings(input);
    res.json(settings);
  });

  // Messages (Chat Logic)
  app.post(api.messages.create.path, async (req, res) => {
    const conversationId = Number(req.params.id);
    const input = api.messages.create.input.parse(req.body);

    // 1. Save User Message
    const userMessage = await storage.createMessage({
      conversationId,
      role: "user",
      content: input.content,
    });

    // 2. Fetch History & Settings
    const history = await storage.getMessages(conversationId);
    const settings = await storage.getSettings();

    // 3. Construct Messages for OpenAI
    const openAiMessages = [
      { role: "system", content: settings.systemPrompt },
      ...history.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }))
    ];

    // 4. Call OpenAI (Streaming could be added here, but for now blocking for simplicity/robustness first)
    // Note: The blueprint suggested streaming, but for the MVP structure matching shared/routes.ts, 
    // we'll return the final message. 
    // If the user wants streaming, we can update the frontend to support it, 
    // but standard POST/response is safer for initial setup.
    
    try {
      const isGpt5 = (settings.model || "gpt-5").startsWith("gpt-5");
      const completion = await openai.chat.completions.create({
        model: settings.model || "gpt-5",
        messages: openAiMessages as any,
        temperature: isGpt5 ? undefined : (settings.temperature || 1),
      });

      const aiContent = completion.choices[0].message.content || "";

      // 5. Save AI Message
      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiContent,
      });

      res.status(201).json(aiMessage);
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ message: "Failed to generate response: " + error.message });
    }
  });

  return httpServer;
}

// Seed function
async function seedDatabase() {
  const conversations = await storage.getConversations();
  if (conversations.length === 0) {
    const convo = await storage.createConversation("Welcome to Lumenia");
    await storage.createMessage({
      conversationId: convo.id,
      role: "assistant",
      content: "Hello. I am Lumenia. I'm here to chat with you without filters. What's on your mind?",
    });
  }
}

// Auto-seed on startup
seedDatabase().catch(console.error);
