import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeDoubao } from "./_core/doubao";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  conversation: router({
    list: publicProcedure.query(async () => {
      return db.getConversations();
    }),
    
    create: publicProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ input }) => {
        const id = await db.createConversation({ title: input.title });
        return { id };
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const conversation = await db.getConversation(input.id);
        if (!conversation) throw new Error("Conversation not found");
        const messages = await db.getMessages(input.id);
        return { conversation, messages };
      }),
  }),

  report: router({
    generate: publicProcedure
      .mutation(async () => {
        // Get recent health records
        const records = await db.getHealthRecords();
        const conversations = await db.getConversations();
        
        if (records.length === 0) {
          throw new Error("没有足够的健康数据生成报告");
        }

        // Prepare data summary for AI analysis
        const dataSummary = records.slice(0, 20).map(r => 
          `${r.type}: ${r.value} ${r.unit} (记录于 ${new Date(r.recordedAt).toLocaleDateString()})`
        ).join("\n");

        // Call Doubao AI to generate report
        const response = await invokeDoubao([
          {
            role: "system",
            content: "你是灵犀健康的专业健康分析师。请基于用户的健康数据生成一份详细的健康分析报告，包括：1. 数据总结 2. 趋势分析 3. 风险评估 4. 改善建议。必须以JSON格式返回，包含 summary, trendAnalysis, riskAssessment, recommendations 四个字段。",
          },
          {
            role: "user",
            content: `请分析以下健康数据并以JSON格式返回结果：\n${dataSummary}\n\n返回格式示例：{"summary": "...", "trendAnalysis": "...", "riskAssessment": "...", "recommendations": "..."}`,
          },
        ]);

        const content = response.choices[0]?.message?.content || '{}';
        
        // Extract JSON from response (in case there's extra text)
        let reportData;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          reportData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        } catch (error) {
          console.error('[Report] Failed to parse AI response:', content);
          throw new Error("AI 返回格式错误，请重试");
        }

        // Save report
        const reportId = await db.createHealthReport({
          title: `健康分析报告 - ${new Date().toLocaleDateString()}`,
          summary: reportData.summary,
          trendAnalysis: reportData.trendAnalysis,
          riskAssessment: reportData.riskAssessment,
          recommendations: reportData.recommendations,
        });

        return { id: reportId };
      }),
    
    list: publicProcedure.query(async () => {
      return db.getHealthReports();
    }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const report = await db.getHealthReport(input.id);
        if (!report) throw new Error("Report not found");
        return report;
      }),
  }),

  health: router({
    create: publicProcedure
      .input(z.object({
        type: z.enum(["weight", "blood_pressure", "heart_rate", "blood_sugar", "temperature"]),
        value: z.string(),
        unit: z.string(),
        note: z.string().optional(),
        recordedAt: z.date(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createHealthRecord(input);
        return { id };
      }),
    
    list: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return db.getHealthRecords(input.type, input.startDate, input.endDate);
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteHealthRecord(input.id);
        return { success: true };
      }),
  }),

  reminder: router({
    create: publicProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["medication", "exercise", "checkup", "custom"]),
        frequency: z.enum(["daily", "weekly", "monthly", "once"]),
        time: z.string(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createReminder({ ...input, enabled: 1 });
        return { id };
      }),
    
    list: publicProcedure.query(async () => {
      return db.getReminders();
    }),
    
    toggle: publicProcedure
      .input(z.object({ id: z.number(), enabled: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.updateReminder(input.id, { enabled: input.enabled ? 1 : 0 });
        return { success: true };
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReminder(input.id);
        return { success: true };
      }),
  }),

  chat: router({
    send: publicProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Save user message
        await db.createMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });

        // Get conversation history
        const messages = await db.getMessages(input.conversationId);
        
        // Call Doubao AI
        const response = await invokeDoubao([
          {
            role: "system",
            content: "你是灵犀健康的专业AI健康顾问。你的任务是提供准确、专业且易于理解的健康咨询服务。请基于医学知识和健康科学为用户提供建议，但要明确指出你不能替代专业医生的诊断。",
          },
          ...messages.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ]);

        const assistantMessage = response.choices[0]?.message?.content || "抱歉，我现在无法回答。";

        // Save assistant message
        await db.createMessage({
          conversationId: input.conversationId,
          role: "assistant",
          content: assistantMessage,
        });

        return { message: assistantMessage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
