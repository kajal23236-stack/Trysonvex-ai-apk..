import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Allow large base64 payloads for multi-modal files, audio, and images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System Health & Engine Information
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SONVEX',
    tagline: 'One AI. Everything in One Place.',
    founder: 'Sonal Yadav',
    created_by: 'Created by Sonal Yadav',
    version: '2.5.0-production',
    geminiConfigured: !!apiKey,
    models: {
      core: 'gemini-3.8-flash',
      image: 'gemini-3.1-flash-lite-image',
      transcribe: 'gemini-3.5-transcribe',
      tts: 'gemini-3.8-flash-lite-tts',
    },
    capabilities: [
      'Universal Command Routing',
      'ChatGPT-Style Neural Chat',
      'Real Google Search Grounding',
      'Document & PDF Intelligence',
      'Vision Analysis & OCR',
      'AI Image Studio',
      'Voice Assistant & Studio TTS',
      '18+ Real Production Tools',
      'Encrypted Personal Workspace',
    ],
  });
});

// Helper: Ensure AI Client is active
function getAI() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure the API key is attached in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. AI Chat & Multi-Turn Conversation (with optional streaming or direct JSON)
app.post('/api/chat', async (req, res) => {
  try {
    const ai = getAI();
    const { messages, attachments, systemInstruction, stream } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const defaultSystem = `You are SONVEX, the ultra-premium AI Operating System created by Sonal Yadav. 
Your core mantra: "One AI. Everything in One Place."
Personality: Highly intelligent, precise, sophisticated, deeply helpful, direct, articulate, and futuristic.
Founder & Creator: Sonal Yadav.
Provide structured, beautiful markdown responses with clear headings, bullet points, and code blocks with syntax tags when relevant.
Never claim you are a generic chatbot. You are the SONVEX AI Operating System.`;

    // Format contents
    const contents: any[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: any[] = [];

      // If user message and has attachments in current request (last message)
      if (role === 'user' && i === messages.length - 1 && attachments && Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.data && att.mimeType) {
            parts.push({
              inlineData: {
                data: att.data,
                mimeType: att.mimeType,
              },
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemInstruction || defaultSystem,
          temperature: 0.7,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemInstruction || defaultSystem,
          temperature: 0.7,
        },
      });

      return res.json({
        content: response.text || '',
      });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during AI processing',
    });
  }
});

// 2. Real Web Search with Google Search Grounding
app.post('/api/search', async (req, res) => {
  const startTime = Date.now();
  try {
    const ai = getAI();
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search the web thoroughly for: "${query}". 
Provide a comprehensive, up-to-date answer synthesized from real search results.
Include key facts, statistics, recent developments, and direct source context.
Distinguish between verified search facts and analytical perspective.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const elapsedMs = Date.now() - startTime;
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract sources cleanly
    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            url: chunk.web.uri,
            snippet: chunk.web.title || '',
          });
        }
      }
    }

    // Deduplicate sources by URL
    const uniqueSources = Array.from(new Map(sources.map((s) => [s.url, s])).values());

    return res.json({
      query,
      answer: response.text || 'No response returned from search model.',
      sources: uniqueSources,
      searchQueries: groundingMetadata?.webSearchQueries || [query],
      elapsedMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    res.status(500).json({
      error: error.message || 'Web search operation failed',
      elapsedMs: Date.now() - startTime,
    });
  }
});

// 3. Document / File Intelligence Q&A
app.post('/api/analyze-file', async (req, res) => {
  try {
    const ai = getAI();
    const { fileName, mimeType, fileData, prompt, task } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'File data is required' });
    }

    const userPrompt = prompt || (task === 'summary' 
      ? 'Provide a concise, executive summary of this document, followed by 5 key takeaways and action points.'
      : task === 'extract_tables'
      ? 'Identify and extract any tabular data, numbers, or structured lists into clean markdown tables with explanations.'
      : 'Analyze this file in detail. Explain its main purpose, key contents, and notable points.');

    const parts: any[] = [];
    // If it's a supported binary inline format (PDF, images, etc.)
    if (mimeType && (mimeType.includes('pdf') || mimeType.startsWith('image/'))) {
      parts.push({
        inlineData: {
          mimeType,
          data: fileData,
        },
      });
    } else {
      // Decode text-based formats (txt, csv, json, md, code)
      let textContent = fileData;
      try {
        const decoded = Buffer.from(fileData, 'base64').toString('utf-8');
        // Check if looks like valid text
        if (!decoded.includes('\u0000')) {
          textContent = decoded;
        }
      } catch {
        // use as-is
      }
      parts.push({
        text: `--- File Content (${fileName || 'document'}) ---\n${textContent.slice(0, 500000)}\n--- End File Content ---`,
      });
    }

    parts.push({
      text: `Document Name: ${fileName || 'Uploaded Document'}\nRequest: ${userPrompt}\n\nProvide a structured, beautifully formatted markdown response.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      fileName,
      result: response.text || '',
    });
  } catch (error: any) {
    console.error('File Analysis Error:', error);
    res.status(500).json({ error: error.message || 'File analysis failed' });
  }
});

// 4. Image Vision Analyzer & OCR
app.post('/api/analyze-image', async (req, res) => {
  try {
    const ai = getAI();
    const { imageData, mimeType, prompt, mode } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    let defaultPrompt = 'Describe this image in rich visual detail, identify all prominent objects, dominant colors, atmosphere, and any notable patterns.';
    if (mode === 'ocr') {
      defaultPrompt = 'Extract all visible text from this image exactly as written. Provide the transcription clearly followed by a summary of the text.';
    } else if (mode === 'palette') {
      defaultPrompt = 'Extract the top 6 dominant colors from this image in HEX format, with descriptive names and visual design mood.';
    }

    const effectivePrompt = prompt || defaultPrompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageData,
            },
          },
          { text: effectivePrompt },
        ],
      },
      config: {
        temperature: 0.4,
      },
    });

    res.json({
      analysis: response.text || '',
    });
  } catch (error: any) {
    console.error('Image Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Image analysis failed' });
  }
});

// 5. AI Image Generation
app.post('/api/generate-image', async (req, res) => {
  try {
    const ai = getAI();
    const { prompt, aspectRatio = '1:1', style } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    const enhancedPrompt = style && style !== 'natural' 
      ? `${prompt}, rendered in ${style} aesthetic, masterpiece, highly detailed, high quality`
      : prompt;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl = '';
      let textNotice = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          } else if (part.text) {
            textNotice += part.text;
          }
        }
      }

      if (imageUrl) {
        return res.json({
          imageUrl,
          prompt: enhancedPrompt,
          aspectRatio,
        });
      } else {
        return res.status(422).json({
          error: 'No image data was generated by the image model.',
          details: textNotice,
        });
      }
    } catch (modelError: any) {
      // If paid model or key restriction, return informative response
      console.warn('Image generation model error:', modelError.message);
      return res.status(402).json({
        error: modelError.message || 'Image generation requires access to gemini-3.1-flash-lite-image',
        needsPaidKey: true,
      });
    }
  } catch (error: any) {
    console.error('Generate Image Route Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// 6. Text-to-Speech (TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const ai = getAI();
    const { text, voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Limit text length for fast speech synthesis
    const trimmedText = text.slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: trimmedText }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      return res.status(500).json({ error: 'Failed to extract synthesized audio from model output.' });
    }
  } catch (error: any) {
    console.error('TTS API Error:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// 7. Voice Audio Transcription
app.post('/api/transcribe', async (req, res) => {
  try {
    const ai = getAI();
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioData,
            },
          },
          { text: 'Transcribe this spoken audio accurately in its spoken language.' },
        ],
      },
    });

    res.json({
      text: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('Transcribe API Error:', error);
    res.status(500).json({ error: error.message || 'Transcription failed' });
  }
});

// 8. Intent Router for Universal Command Bar
app.post('/api/route-intent', async (req, res) => {
  try {
    const ai = getAI();
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const prompt = `Classify the user intent for the SONVEX AI Operating System into one of the following exact tools:
- "chat" (General question, conversation, explanation, advice)
- "search" (Current events, real-time facts, web search, latest information)
- "image_studio" (Generate image, draw, create graphic, visual art)
- "translator" (Translate words/sentences between languages)
- "summarizer" (Summarize article, notes, text)
- "writer" (Draft email, essay, blog, story, post, document)
- "calculator" (Math calculation, equation, algebra, numerical problem)
- "unit_converter" (Convert metric, imperial, temperature, speed, storage)
- "currency" (Currency exchange, dollar to rupee/euro, forex)
- "qr_code" (Generate QR code for url/text)
- "notes" (Take a note, save quick thought)
- "tasks" (Add task, todo list, project plan)
- "timer" (Set timer, stopwatch, focus pomodoro)
- "image_analyzer" (Analyze an image, OCR, visual inspection)
- "password" (Generate secure password, security key)
- "founder" (Questions about who built SONVEX, Sonal Yadav, founder information)

User Query: "${query}"

Return a valid JSON object with:
{
  "tool": "string (one of above)",
  "confidence": number (0-1),
  "quickAnswer": "string (a concise, direct, helpful immediate response or calculation result if applicable, otherwise brief sentence of what SONVEX will do)",
  "extractedParams": {}
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Route Intent Error:', error);
    // Graceful fallback
    res.json({
      tool: 'chat',
      confidence: 0.5,
      quickAnswer: 'Processing your request with SONVEX Core Intelligence...',
    });
  }
});

// 9. Dedicated Tool Endpoints (AI Writer, Summarizer, Translator, Math Solver)
app.post('/api/tools/writer', async (req, res) => {
  try {
    const ai = getAI();
    const { topic, type = 'blog', tone = 'professional', length = 'medium', keyPoints } = req.body;

    const prompt = `Write a high-quality ${type} about: "${topic}".
Tone: ${tone}
Length: ${length}
${keyPoints ? `Key points to incorporate:\n${keyPoints}` : ''}

Format with elegant headings, markdown emphasis, and impactful closing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.7 },
    });

    res.json({ result: response.text || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tools/summarize', async (req, res) => {
  try {
    const ai = getAI();
    const { text, format = 'bullets', length = 'balanced' } = req.body;

    const prompt = `Summarize the following text:
Format: ${format} (options: bullets, executive, tldr)
Length: ${length}

Text to summarize:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.3 },
    });

    res.json({ result: response.text || '' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tools/translate', async (req, res) => {
  try {
    const ai = getAI();
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    const prompt = `Translate the following text accurately into ${targetLanguage}.
${sourceLanguage !== 'auto' ? `Source language: ${sourceLanguage}` : 'Detect source language automatically.'}
Preserve nuance, professional tone, and idioms appropriately.

Provide output as JSON:
{
  "translatedText": "string",
  "detectedSourceLanguage": "string",
  "phoneticOrPronunciation": "string (optional phonetic guide if applicable, else empty)",
  "contextNotes": "string (brief note on cultural or contextual nuance if relevant, else empty)"
}

Text:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tools/math-solve', async (req, res) => {
  try {
    const ai = getAI();
    const { problem } = req.body;

    const prompt = `Solve this mathematical or scientific problem with exact rigor:
Problem: "${problem}"

Provide output as JSON:
{
  "finalAnswer": "string (exact result)",
  "steps": ["step 1 description", "step 2 description", "..."],
  "formulaUsed": "string",
  "verification": "string",
  "practicalApplication": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// APK download / info endpoint
app.get('/download/sonvex.apk', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="hi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SONVEX Android App</title>
        <style>
          body { font-family: sans-serif; background: #05070b; color: #fff; padding: 20px; text-align: center; }
          .card { background: #0c1220; border: 1px solid #06b6d4; padding: 24px; border-radius: 16px; max-width: 480px; margin: 40px auto; }
          .btn { display: inline-block; background: #06b6d4; color: #000; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 16px; }
          h2 { color: #22d3ee; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>SONVEX Android App</h2>
          <p>Android phone par app install karne ke liye:</p>
          <p>1. Neeche diye button par click karein.<br>2. Chrome menu (3 dots) par tap karein.<br>3. <b>"Install app"</b> select karein!</p>
          <a class="btn" href="/">Open & Install SONVEX</a>
        </div>
      </body>
    </html>
  `);
});

// Direct README.md download for GitHub upload
app.get('/download/README.md', (req, res) => {
  const filePath = path.resolve(__dirname, 'public', 'README.md');
  res.download(filePath, 'README.md');
});

// App bundle info endpoint
app.get('/api/download-bundle', (req, res) => {
  res.json({
    status: 'ready',
    appName: 'SONVEX',
    repository: 'https://github.com/kajal23236-stack/Trysonvex-ai-apk',
    manifest: '/manifest.webmanifest',
    pwa: true,
  });
});

// Mount Vite or Static Frontend
async function start() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true as true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SONVEX] Ultra-Premium AI Operating System running on http://0.0.0.0:${PORT}`);
  });
}

start();
