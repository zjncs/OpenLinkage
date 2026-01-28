/**
 * API layer for Electron IPC communication
 * Replaces tRPC with direct Electron API calls
 * Falls back to mock backend in browser environment
 */

import {
  mockConversationAPI,
  mockMessageAPI,
  mockHealthAPI,
  mockReportAPI,
  mockReminderAPI,
  mockAIAPI,
  mockSystemAPI,
} from './mock-backend';

// Check if running in Electron environment
const isElectron = typeof window !== 'undefined' && window.electronAPI;

if (!isElectron) {
  console.warn('[API] Not running in Electron environment, using mock backend');
}

// Conversation API
export const conversationAPI = {
  create: async (title: string) => {
    if (!isElectron) return mockConversationAPI.create(title);
    return window.electronAPI!.conversationCreate(title);
  },
  
  list: async () => {
    if (!isElectron) return mockConversationAPI.list();
    return window.electronAPI!.conversationList();
  },
  
  get: async (id: number) => {
    if (!isElectron) return mockConversationAPI.get(id);
    return window.electronAPI!.conversationGet(id);
  },
  
  delete: async (id: number) => {
    if (!isElectron) return mockConversationAPI.delete(id);
    return window.electronAPI!.conversationDelete(id);
  },
};

// Message API
export const messageAPI = {
  create: async (data: { conversationId: number; role: string; content: string }) => {
    if (!isElectron) return mockMessageAPI.create(data);
    return window.electronAPI!.messageCreate(data);
  },
};

// Health Record API
export const healthAPI = {
  create: async (data: {
    type: string;
    value: string;
    unit: string;
    notes?: string;
    recordedAt: number;
  }) => {
    if (!isElectron) return mockHealthAPI.create(data);
    return window.electronAPI!.healthCreate(data);
  },
  
  list: async (type?: string) => {
    if (!isElectron) return mockHealthAPI.list(type);
    return window.electronAPI!.healthList(type);
  },
  
  delete: async (id: number) => {
    if (!isElectron) return mockHealthAPI.delete(id);
    return window.electronAPI!.healthDelete(id);
  },
};

// Health Report API
export const reportAPI = {
  create: async (data: {
    title: string;
    summary: string;
    trendAnalysis: string;
    riskAssessment: string;
    recommendations: string;
  }) => {
    if (!isElectron) return mockReportAPI.create(data);
    return window.electronAPI!.reportCreate(data);
  },
  
  list: async () => {
    if (!isElectron) return mockReportAPI.list();
    return window.electronAPI!.reportList();
  },
  
  get: async (id: number) => {
    if (!isElectron) return mockReportAPI.get(id);
    return window.electronAPI!.reportGet(id);
  },
};

// Reminder API
export const reminderAPI = {
  create: async (data: {
    title: string;
    description?: string;
    type: string;
    frequency: string;
    time: string;
  }) => {
    if (!isElectron) return mockReminderAPI.create(data);
    return window.electronAPI!.reminderCreate(data);
  },
  
  list: async () => {
    if (!isElectron) return mockReminderAPI.list();
    return window.electronAPI!.reminderList();
  },
  
  update: async (data: { id: number; enabled: boolean }) => {
    if (!isElectron) return mockReminderAPI.update(data);
    return window.electronAPI!.reminderUpdate(data);
  },
  
  delete: async (id: number) => {
    if (!isElectron) return mockReminderAPI.delete(id);
    return window.electronAPI!.reminderDelete(id);
  },
};

// AI API
export const aiAPI = {
  chat: async (messages: Array<{ role: string; content: string }>) => {
    if (!isElectron) return mockAIAPI.chat(messages);
    return window.electronAPI!.aiChat(messages);
  },
  
  generateReport: async (dataSummary: string) => {
    if (!isElectron) return mockAIAPI.generateReport(dataSummary);
    return window.electronAPI!.aiGenerateReport(dataSummary);
  },
};

// System API
export const systemAPI = {
  showNotification: async (title: string, body: string) => {
    if (!isElectron) return mockSystemAPI.showNotification(title, body);
    return window.electronAPI!.showNotification(title, body);
  },
  
  getAppVersion: async () => {
    if (!isElectron) return mockSystemAPI.getAppVersion();
    return window.electronAPI!.getAppVersion();
  },
  
  getAppPath: async () => {
    if (!isElectron) return mockSystemAPI.getAppPath();
    return window.electronAPI!.getAppPath();
  },
};
