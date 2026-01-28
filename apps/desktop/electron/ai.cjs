const axios = require('axios');

/**
 * Call Doubao AI API from Electron main process
 */
async function callDoubaoAI(messages, apiKey, apiUrl, model) {
  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY is not configured');
  }

  const url = apiUrl || 'https://ark.cn-beijing.volces.com/api/v3/responses';
  const modelName = model || 'doubao-seed-1-8-251228';

  // Convert standard message format to Doubao format
  const doubaoMessages = messages.map(msg => ({
    role: msg.role,
    content: [
      {
        type: 'input_text',
        text: msg.content,
      },
    ],
  }));

  try {
    const response = await axios.post(
      url,
      {
        model: modelName,
        input: doubaoMessages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('[AI] Error calling Doubao API:', error.response?.data || error.message);
    throw new Error(`AI API call failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

module.exports = {
  callDoubaoAI
};
