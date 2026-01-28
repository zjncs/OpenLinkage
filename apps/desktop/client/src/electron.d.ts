export interface ElectronAPI {
  // System
  showNotification: (title: string, body: string) => Promise<{ success: boolean; error?: string }>;
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  
  // Conversations
  conversationCreate: (title: string) => Promise<{ id: number }>;
  conversationList: () => Promise<any[]>;
  conversationGet: (id: number) => Promise<{ conversation: any; messages: any[] }>;
  conversationDelete: (id: number) => Promise<{ success: boolean }>;
  
  // Messages
  messageCreate: (data: { conversationId: number; role: string; content: string }) => Promise<{ id: number }>;
  
  // Health Records
  healthCreate: (data: { type: string; value: string; unit: string; notes?: string; recordedAt: number }) => Promise<{ id: number }>;
  healthList: (type?: string) => Promise<any[]>;
  healthDelete: (id: number) => Promise<{ success: boolean }>;
  
  // Health Reports
  reportCreate: (data: { title: string; summary: string; trendAnalysis: string; riskAssessment: string; recommendations: string }) => Promise<{ id: number }>;
  reportList: () => Promise<any[]>;
  reportGet: (id: number) => Promise<any>;
  
  // Reminders
  reminderCreate: (data: { title: string; description?: string; type: string; frequency: string; time: string }) => Promise<{ id: number }>;
  reminderList: () => Promise<any[]>;
  reminderUpdate: (data: { id: number; enabled: boolean }) => Promise<{ success: boolean }>;
  reminderDelete: (id: number) => Promise<{ success: boolean }>;
  
  // AI
  aiChat: (messages: Array<{ role: string; content: string }>) => Promise<any>;
  aiGenerateReport: (dataSummary: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
