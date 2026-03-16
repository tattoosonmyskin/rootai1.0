/**
 * Local LLM Client
 * Calls any OpenAI-compatible API (OpenAI, Ollama, etc.)
 * Configure via environment variables in your .env file.
 */

const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY || '';
const LLM_BASE_URL = (import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini';

/**
 * Invoke an LLM with a prompt and optional JSON schema for structured output.
 * @param {object} params
 * @param {string} params.prompt - The user prompt
 * @param {object} [params.response_json_schema] - JSON schema for structured output
 * @returns {Promise<object>} Parsed JSON response
 */
export async function invokeLLM({ prompt, response_json_schema }) {
  if (!LLM_API_KEY) {
    throw new Error(
      'No LLM API key configured. Please set VITE_LLM_API_KEY in your .env file.\n' +
      'Copy .env.example to .env and fill in your API key.'
    );
  }

  const systemPrompt = response_json_schema
    ? 'You are a helpful AI assistant. Respond ONLY with valid JSON that matches the requested schema. No markdown, no explanation, just JSON.'
    : 'You are a helpful AI assistant.';

  const requestBody = {
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    ...(response_json_schema ? { response_format: { type: 'json_object' } } : {})
  };

  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(`LLM API error: ${errorMessage}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (response_json_schema) {
    try {
      return JSON.parse(content);
    } catch {
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          // Return a best-effort object
        }
      }
      return { answer: content };
    }
  }

  return content;
}
