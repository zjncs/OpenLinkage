const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // System
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Conversations
  conversationCreate: (title) => ipcRenderer.invoke('conversation:create', title),
  conversationList: () => ipcRenderer.invoke('conversation:list'),
  conversationGet: (id) => ipcRenderer.invoke('conversation:get', id),
  conversationDelete: (id) => ipcRenderer.invoke('conversation:delete', id),
  
  // Messages
  messageCreate: (data) => ipcRenderer.invoke('message:create', data),
  
  // Health Records
  healthCreate: (data) => ipcRenderer.invoke('health:create', data),
  healthList: (type) => ipcRenderer.invoke('health:list', type),
  healthDelete: (id) => ipcRenderer.invoke('health:delete', id),
  
  // Health Reports
  reportCreate: (data) => ipcRenderer.invoke('report:create', data),
  reportList: () => ipcRenderer.invoke('report:list'),
  reportGet: (id) => ipcRenderer.invoke('report:get', id),
  
  // Reminders
  reminderCreate: (data) => ipcRenderer.invoke('reminder:create', data),
  reminderList: () => ipcRenderer.invoke('reminder:list'),
  reminderUpdate: (data) => ipcRenderer.invoke('reminder:update', data),
  reminderDelete: (id) => ipcRenderer.invoke('reminder:delete', id),
  
  // AI
  aiChat: (messages) => ipcRenderer.invoke('ai:chat', messages),
  aiGenerateReport: (dataSummary) => ipcRenderer.invoke('ai:generate-report', dataSummary),
});
