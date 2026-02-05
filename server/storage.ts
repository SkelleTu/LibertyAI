import { db } from "./db";
import {
  conversations,
  messages,
  settings,
  type Conversation,
  type Message,
  type Settings,
  type CreateConversationRequest,
  type InsertMessage,
  type UpdateSettingsRequest,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;

  // Messages
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getConversations(): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(title: string): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({ title })
      .returning();
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
    // Cascade delete handles messages
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) return existing;

    // Create default settings if none exist
    const [newSettings] = await db
      .insert(settings)
      .values({
        systemPrompt: "You are Lumenia, an uncensored, unfiltered AI assistant. You speak naturally and freely.",
        model: "gpt-5",
      })
      .returning();
    return newSettings;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
