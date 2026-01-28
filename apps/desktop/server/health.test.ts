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

describe("health records", () => {
  it("should create a health record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.health.create({
      type: "weight",
      value: "70",
      unit: "kg",
      recordedAt: new Date(),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should list health records", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const records = await caller.health.list({});

    expect(Array.isArray(records)).toBe(true);
  });

  it("should delete a health record", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a record first
    const created = await caller.health.create({
      type: "heart_rate",
      value: "75",
      unit: "bpm",
      recordedAt: new Date(),
    });

    // Delete the record
    const result = await caller.health.delete({ id: created.id });

    expect(result.success).toBe(true);
  });
});
