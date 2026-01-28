import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("conversation", () => {
  it("should create a new conversation", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversation.create({ title: "Test Conversation" });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list conversations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversation.list();

    expect(Array.isArray(conversations)).toBe(true);
  });

  it("should get conversation with messages", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a conversation first
    const created = await caller.conversation.create({ title: "Test Conversation" });

    // Get the conversation
    const result = await caller.conversation.get({ id: created.id });

    expect(result).toHaveProperty("conversation");
    expect(result).toHaveProperty("messages");
    expect(result.conversation.title).toBe("Test Conversation");
    expect(Array.isArray(result.messages)).toBe(true);
  });
});
