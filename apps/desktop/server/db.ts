import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversations, messages, InsertConversation, InsertMessage, healthRecords, InsertHealthRecord, healthReports, InsertHealthReport, reminders, InsertReminder } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Conversation queries
export async function createConversation(data: InsertConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(conversations).values(data);
  return result[0].insertId;
}

export async function getConversations() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

export async function getConversation(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversationTitle(id: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(conversations).set({ title, updatedAt: new Date() }).where(eq(conversations.id, id));
}

// Message queries
export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

// Health record queries
export async function createHealthRecord(data: InsertHealthRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(healthRecords).values(data);
  return result[0].insertId;
}

export async function getHealthRecords(type?: string, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (type) conditions.push(eq(healthRecords.type, type as any));
  if (startDate) conditions.push(gte(healthRecords.recordedAt, startDate));
  if (endDate) conditions.push(lte(healthRecords.recordedAt, endDate));
  
  const query = conditions.length > 0
    ? db.select().from(healthRecords).where(and(...conditions)).orderBy(desc(healthRecords.recordedAt))
    : db.select().from(healthRecords).orderBy(desc(healthRecords.recordedAt));
  
  return query;
}

export async function deleteHealthRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(healthRecords).where(eq(healthRecords.id, id));
}

// Health report queries
export async function createHealthReport(data: InsertHealthReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(healthReports).values(data);
  return result[0].insertId;
}

export async function getHealthReports() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(healthReports).orderBy(desc(healthReports.createdAt));
}

export async function getHealthReport(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(healthReports).where(eq(healthReports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Reminder queries
export async function createReminder(data: InsertReminder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reminders).values(data);
  return result[0].insertId;
}

export async function getReminders() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reminders).orderBy(desc(reminders.createdAt));
}

export async function updateReminder(id: number, data: Partial<InsertReminder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(reminders).set(data).where(eq(reminders.id, id));
}

export async function deleteReminder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(reminders).where(eq(reminders.id, id));
}
