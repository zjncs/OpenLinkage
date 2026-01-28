const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { initDatabase, closeDatabase, conversationOps, messageOps, healthOps, reportOps, reminderOps } = require('./database.cjs');
const { callDoubaoAI } = require('./ai.cjs');
require('dotenv').config();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FAF8F5',
    show: false,
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database
  initDatabase();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});

// IPC Handlers
ipcMain.handle('show-notification', async (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
    });
    notification.show();
    return { success: true };
  }
  return { success: false, error: 'Notifications not supported' };
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', async () => {
  return app.getPath('userData');
});

// Database IPC Handlers

// Conversations
ipcMain.handle('conversation:create', async (event, title) => {
  return conversationOps.create(title);
});

ipcMain.handle('conversation:list', async () => {
  return conversationOps.list();
});

ipcMain.handle('conversation:get', async (event, id) => {
  const conversation = conversationOps.get(id);
  const messages = messageOps.list(id);
  return { conversation, messages };
});

ipcMain.handle('conversation:delete', async (event, id) => {
  return conversationOps.delete(id);
});

// Messages
ipcMain.handle('message:create', async (event, { conversationId, role, content }) => {
  return messageOps.create(conversationId, role, content);
});

// Health Records
ipcMain.handle('health:create', async (event, { type, value, unit, notes, recordedAt }) => {
  return healthOps.create(type, value, unit, notes, recordedAt);
});

ipcMain.handle('health:list', async (event, type) => {
  return healthOps.list(type);
});

ipcMain.handle('health:delete', async (event, id) => {
  return healthOps.delete(id);
});

// Health Reports
ipcMain.handle('report:create', async (event, { title, summary, trendAnalysis, riskAssessment, recommendations }) => {
  return reportOps.create(title, summary, trendAnalysis, riskAssessment, recommendations);
});

ipcMain.handle('report:list', async () => {
  return reportOps.list();
});

ipcMain.handle('report:get', async (event, id) => {
  return reportOps.get(id);
});

// Reminders
ipcMain.handle('reminder:create', async (event, { title, description, type, frequency, time }) => {
  return reminderOps.create(title, description, type, frequency, time);
});

ipcMain.handle('reminder:list', async () => {
  return reminderOps.list();
});

ipcMain.handle('reminder:update', async (event, { id, enabled }) => {
  return reminderOps.update(id, enabled);
});

ipcMain.handle('reminder:delete', async (event, id) => {
  return reminderOps.delete(id);
});

// AI IPC Handlers
ipcMain.handle('ai:chat', async (event, messages) => {
  const apiKey = process.env.DOUBAO_API_KEY;
  const apiUrl = process.env.DOUBAO_API_URL;
  const model = process.env.DOUBAO_MODEL;
  
  return await callDoubaoAI(messages, apiKey, apiUrl, model);
});

ipcMain.handle('ai:generate-report', async (event, dataSummary) => {
  const apiKey = process.env.DOUBAO_API_KEY;
  const apiUrl = process.env.DOUBAO_API_URL;
  const model = process.env.DOUBAO_MODEL;
  
  const messages = [
    {
      role: 'system',
      content: '你是灵犀健康的专业健康分析师。请基于用户的健康数据生成一份详细的健康分析报告，包括：1. 数据总结 2. 趋势分析 3. 风险评估 4. 改善建议。必须以JSON格式返回，包含 summary, trendAnalysis, riskAssessment, recommendations 四个字段。',
    },
    {
      role: 'user',
      content: `请分析以下健康数据并以JSON格式返回结果：\n${dataSummary}\n\n返回格式示例：{"summary": "...", "trendAnalysis": "...", "riskAssessment": "...", "recommendations": "..."}`,
    },
  ];
  
  return await callDoubaoAI(messages, apiKey, apiUrl, model);
});
