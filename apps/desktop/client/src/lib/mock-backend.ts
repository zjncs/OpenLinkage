/**
 * Mock backend for browser development
 * Simulates Electron API with in-memory data
 */

// In-memory data store
let conversations: any[] = [];
let messages: any[] = [];
let healthRecords: any[] = [];
let healthReports: any[] = [];
let reminders: any[] = [];

let conversationIdCounter = 1;
let messageIdCounter = 1;
let healthIdCounter = 1;
let reportIdCounter = 1;
let reminderIdCounter = 1;

// Mock Conversation API
export const mockConversationAPI = {
  create: async (title: string) => {
    const conversation = {
      id: conversationIdCounter++,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversations.push(conversation);
    return { id: conversation.id };
  },
  
  list: async () => {
    return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  },
  
  get: async (id: number) => {
    const conversation = conversations.find(c => c.id === id);
    const conversationMessages = messages.filter(m => m.conversationId === id);
    return {
      conversation,
      messages: conversationMessages,
    };
  },
  
  delete: async (id: number) => {
    conversations = conversations.filter(c => c.id !== id);
    messages = messages.filter(m => m.conversationId !== id);
    return { success: true };
  },
};

// Mock Message API
export const mockMessageAPI = {
  create: async (data: { conversationId: number; role: string; content: string }) => {
    const message = {
      id: messageIdCounter++,
      ...data,
      createdAt: Date.now(),
    };
    messages.push(message);
    
    // Update conversation updatedAt
    const conversation = conversations.find(c => c.id === data.conversationId);
    if (conversation) {
      conversation.updatedAt = Date.now();
    }
    
    return { id: message.id };
  },
};

// Mock Health API
export const mockHealthAPI = {
  create: async (data: any) => {
    const record = {
      id: healthIdCounter++,
      ...data,
      createdAt: Date.now(),
    };
    healthRecords.push(record);
    return { id: record.id };
  },
  
  list: async (type?: string) => {
    let records = [...healthRecords];
    if (type) {
      records = records.filter(r => r.type === type);
    }
    return records.sort((a, b) => b.recordedAt - a.recordedAt);
  },
  
  delete: async (id: number) => {
    healthRecords = healthRecords.filter(r => r.id !== id);
    return { success: true };
  },
};

// Mock Report API
export const mockReportAPI = {
  create: async (data: any) => {
    const report = {
      id: reportIdCounter++,
      ...data,
      createdAt: Date.now(),
    };
    healthReports.push(report);
    return { id: report.id };
  },
  
  list: async () => {
    return [...healthReports].sort((a, b) => b.createdAt - a.createdAt);
  },
  
  get: async (id: number) => {
    return healthReports.find(r => r.id === id);
  },
};

// Mock Reminder API
export const mockReminderAPI = {
  create: async (data: any) => {
    const reminder = {
      id: reminderIdCounter++,
      ...data,
      enabled: true,
      createdAt: Date.now(),
    };
    reminders.push(reminder);
    return { id: reminder.id };
  },
  
  list: async () => {
    return [...reminders].sort((a, b) => b.createdAt - a.createdAt);
  },
  
  update: async (data: { id: number; enabled: boolean }) => {
    const reminder = reminders.find(r => r.id === data.id);
    if (reminder) {
      reminder.enabled = data.enabled;
    }
    return { success: true };
  },
  
  delete: async (id: number) => {
    reminders = reminders.filter(r => r.id !== id);
    return { success: true };
  },
};

// Mock AI API
export const mockAIAPI = {
  chat: async (messages: Array<{ role: string; content: string }>) => {
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userMessage = messages[messages.length - 1]?.content || '';
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: `这是模拟的 AI 回复。您的问题是："${userMessage}"。\n\n在实际的 Electron 应用中，这里会调用真实的豆包 AI API 来生成专业的健康建议。`,
        },
      }],
    };
  },
  
  generateReport: async (dataSummary: string) => {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      choices: [{
        message: {
          content: JSON.stringify({
            summary: '根据您最近的健康数据，整体状况良好。',
            trendAnalysis: '体重、血压和心率等指标在正常范围内，呈现稳定趋势。',
            riskAssessment: '目前未发现明显的健康风险，建议继续保持良好的生活习惯。',
            recommendations: '建议每天保持适量运动，均衡饮食，充足睡眠。定期记录健康数据以便长期跟踪。',
          }),
        },
      }],
    };
  },
};

// Mock System API
export const mockSystemAPI = {
  showNotification: async (title: string, body: string) => {
    console.log('[Mock Notification]', title, body);
    // Try to use browser notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return { success: true };
  },
  
  getAppVersion: async () => {
    return '1.0.0';
  },
  
  getAppPath: async () => {
    return '/mock/user/data/path';
  },
};
