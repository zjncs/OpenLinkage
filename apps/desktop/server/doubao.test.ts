import { describe, expect, it } from "vitest";
import { invokeDoubao } from "./_core/doubao";

describe("Doubao API", () => {
  it("should successfully call Doubao AI API with valid credentials", async () => {
    const response = await invokeDoubao([
      {
        role: "user",
        content: "你好，请简单介绍一下你自己。",
      },
    ]);

    expect(response).toHaveProperty("choices");
    expect(Array.isArray(response.choices)).toBe(true);
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]).toHaveProperty("message");
    expect(response.choices[0].message).toHaveProperty("content");
    expect(typeof response.choices[0].message.content).toBe("string");
    expect(response.choices[0].message.content.length).toBeGreaterThan(0);
  }, 30000); // 30 seconds timeout for API call

  it("should handle conversation context correctly", async () => {
    const response = await invokeDoubao([
      {
        role: "system",
        content: "你是一个健康顾问。",
      },
      {
        role: "user",
        content: "什么是健康饮食？",
      },
    ]);

    expect(response.choices[0].message.content).toBeTruthy();
    expect(response.choices[0].message.content.length).toBeGreaterThan(10);
  }, 30000);
});
