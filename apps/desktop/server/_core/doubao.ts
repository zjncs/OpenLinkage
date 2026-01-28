import axios from 'axios';

/**
 * Doubao (豆包) AI API configuration and helper functions
 */

interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant';
  content: Array<{
    type: 'input_text' | 'input_image';
    text?: string;
    image_url?: string;
  }> | string;
}

interface DoubaoRequest {
  model: string;
  input: DoubaoMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface DoubaoResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call Doubao AI API
 * @param messages - Array of messages in standard format
 * @param options - Additional options (temperature, max_tokens, etc.)
 * @returns Doubao API response
 */
export async function invokeDoubao(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<DoubaoResponse> {
  const apiKey = process.env.DOUBAO_API_KEY;
  const apiUrl = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/responses';
  const model = process.env.DOUBAO_MODEL || 'doubao-seed-1-8-251228';

  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY environment variable is not set');
  }

  // Convert standard message format to Doubao format
  const doubaoMessages: DoubaoMessage[] = messages.map(msg => ({
    role: msg.role,
    content: [
      {
        type: 'input_text' as const,
        text: msg.content,
      },
    ],
  }));

  const requestBody: DoubaoRequest = {
    model,
    input: doubaoMessages,
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
  };

  try {
    const response = await axios.post<DoubaoResponse>(apiUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('[Doubao API] Error:', error.response?.data || error.message);
    throw new Error(`Doubao API call failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

/**
 * Call Doubao AI API with streaming support (if needed in the future)
 * Note: Current implementation returns full response, streaming can be added later
 */
export async function invokeDoubaoStream(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<DoubaoResponse> {
  // For now, use the same non-streaming implementation
  // Streaming can be implemented later if Doubao API supports it
  return invokeDoubao(messages, options);
}
