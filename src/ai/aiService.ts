import { logger } from '../utils/logger';
import { buildResumePrompt } from './prompts';

const isValidJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const callAiService = async (payload: {
  resumeText?: string;
  requiredSchema?: unknown;
  instructions?: string;
  field?: { label?: string; description?: string; type?: string; options?: string[] };
  resume?: unknown;
}) => {
  const apiKey = import.meta.env.VITE_AI_API_KEY || process.env?.AI_API_KEY || '';
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || process.env?.AI_API_ENDPOINT || '';
  const model = import.meta.env.VITE_AI_MODEL || process.env?.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey || !endpoint) {
    throw new Error('AI configuration is missing. Set AI credentials in environment variables.');
  }

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: payload.instructions || 'Return valid JSON only and do not invent unsupported data.'
      },
      {
        role: 'user',
        content: JSON.stringify(payload, null, 2)
      }
    ],
    response_format: { type: 'json_object' }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}.`);
  }

  const json = await response.json();
  const rawMessage = json?.choices?.[0]?.message?.content ?? json?.content ?? json;

  if (typeof rawMessage !== 'string') {
    if (isValidJsonObject(rawMessage)) {
      return rawMessage;
    }
    throw new Error('AI returned an invalid response shape.');
  }

  try {
    const parsed = JSON.parse(rawMessage);
    if (!isValidJsonObject(parsed)) {
      throw new Error('AI response was not a valid object.');
    }
    return parsed;
  } catch (error) {
    logger.error('AI response parse failed', error);
    throw new Error('AI response could not be parsed as JSON.');
  }
};

export const enrichResumeWithAI = async (resumeText: string) => {
  const prompt = buildResumePrompt(resumeText);
  return callAiService({ resumeText, instructions: prompt.messages[0].content as string, requiredSchema: {} });
};
