import { SearchResponseData, SystemHealthData } from '../types';

export const API_BASE = '/api';

export async function fetchSystemHealth(): Promise<SystemHealthData> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>,
  attachments?: Array<{ name: string; mimeType: string; data: string }>,
  systemInstruction?: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  // If streaming handler provided, try streaming with SSE
  if (onChunk) {
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          attachments,
          systemInstruction,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataPayload = line.slice(6).trim();
              if (dataPayload === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataPayload);
                if (parsed.text) {
                  fullText += parsed.text;
                  onChunk(parsed.text);
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
        return fullText;
      }
    } catch (streamErr: any) {
      if (streamErr.name === 'AbortError') {
        throw streamErr;
      }
      console.warn('Streaming failed, falling back to unary chat:', streamErr);
    }
  }

  // Unary fallback
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      attachments,
      systemInstruction,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `AI processing failed with status ${res.status}`);
  }

  const data = await res.json();
  if (onChunk && data.content) {
    onChunk(data.content);
  }
  return data.content || '';
}

export async function executeWebSearch(query: string): Promise<SearchResponseData> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Web search query failed');
  }

  return res.json();
}

export async function analyzeDocument(
  fileName: string,
  mimeType: string,
  fileData: string,
  prompt?: string,
  task?: string
): Promise<{ fileName: string; result: string }> {
  const res = await fetch(`${API_BASE}/analyze-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, mimeType, fileData, prompt, task }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Document analysis failed');
  }

  return res.json();
}

export async function analyzeVision(
  imageData: string,
  mimeType: string,
  prompt?: string,
  mode?: 'general' | 'ocr' | 'palette'
): Promise<{ analysis: string }> {
  const res = await fetch(`${API_BASE}/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, mimeType, prompt, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Vision analysis failed');
  }

  return res.json();
}

export async function generateAIImage(
  prompt: string,
  aspectRatio: string = '1:1',
  style?: string
): Promise<{ imageUrl: string; prompt: string; aspectRatio: string }> {
  const res = await fetch(`${API_BASE}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, style }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Image generation failed');
  }

  return res.json();
}

export async function synthesizeTTS(text: string, voice: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
  const res = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Speech synthesis failed');
  }

  return res.json();
}

export async function transcribeAudioData(audioData: string, mimeType: string = 'audio/webm'): Promise<{ text: string }> {
  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioData, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Audio transcription failed');
  }

  return res.json();
}

export async function routeIntent(query: string): Promise<{
  tool: string;
  confidence: number;
  quickAnswer: string;
  extractedParams?: Record<string, any>;
}> {
  const res = await fetch(`${API_BASE}/route-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    return {
      tool: 'chat',
      confidence: 0.5,
      quickAnswer: 'Processing with SONVEX Core AI...',
    };
  }

  return res.json();
}

export async function generateWriterText(params: {
  topic: string;
  type?: string;
  tone?: string;
  length?: string;
  keyPoints?: string;
}): Promise<{ result: string }> {
  const res = await fetch(`${API_BASE}/tools/writer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI Writer generation failed');
  }

  return res.json();
}

export async function generateSummaryText(params: {
  text: string;
  format?: string;
  length?: string;
}): Promise<{ result: string }> {
  const res = await fetch(`${API_BASE}/tools/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Summarization failed');
  }

  return res.json();
}

export async function translateTextContent(params: {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}): Promise<{
  translatedText: string;
  detectedSourceLanguage: string;
  phoneticOrPronunciation?: string;
  contextNotes?: string;
}> {
  const res = await fetch(`${API_BASE}/tools/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Translation failed');
  }

  return res.json();
}

export async function solveMathEquation(problem: string): Promise<{
  finalAnswer: string;
  steps: string[];
  formulaUsed?: string;
  verification?: string;
  practicalApplication?: string;
}> {
  const res = await fetch(`${API_BASE}/tools/math-solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Math solver failed');
  }

  return res.json();
}
