import * as gemini from './providers/gemini.provider.js';
import * as claude from './providers/claude.provider.js';
import * as openai from './providers/openai.provider.js';
import { db } from '../db.js';

const PROVIDERS = { gemini, claude, openai };

/**
 * Model registry, cheapest-first within each capability tier. Prices are
 * approximate USD per 1M tokens (blended input/output) as of the model's
 * release generation — re-check provider pricing pages periodically and
 * adjust `costPer1kChars` (used here as a cheap proxy for token cost since
 * we don't tokenize before dispatch).
 *
 * Tiers:
 *  - quick:   short, low-stakes lookups (majority of personal-shopper chat)
 *  - vision:  the request includes an image and needs multimodal input
 *  - complex: high-value / bulk / business procurement decisions, where
 *             answer quality matters more than shaving fractions of a cent
 */
const MODEL_TIERS = {
  quick: [
    { provider: 'gemini', modelId: 'gemini-1.5-flash', costPer1kChars: 0.00011 },
    { provider: 'openai', modelId: 'gpt-4o-mini', costPer1kChars: 0.00035 },
    { provider: 'claude', modelId: 'claude-haiku-4-5-20251001', costPer1kChars: 0.0006 }
  ],
  vision: [
    { provider: 'gemini', modelId: 'gemini-1.5-flash', costPer1kChars: 0.00011 },
    { provider: 'openai', modelId: 'gpt-4o-mini', costPer1kChars: 0.00035 },
    { provider: 'claude', modelId: 'claude-haiku-4-5-20251001', costPer1kChars: 0.0006 }
  ],
  complex: [
    { provider: 'claude', modelId: 'claude-sonnet-5', costPer1kChars: 0.0025 },
    { provider: 'openai', modelId: 'gpt-4o', costPer1kChars: 0.003 },
    { provider: 'gemini', modelId: 'gemini-1.5-pro', costPer1kChars: 0.0018 }
  ]
};

const HIGH_VALUE_NGN_THRESHOLD = 1000000; // ₦1,000,000+

export const classifyTask = ({ prompt = '', imageBase64, mode }) => {
  if (imageBase64) return 'vision';

  const text = prompt.toLowerCase();
  const mentionsBulk = /\b(\d{2,}x|rfq|bulk|wholesale|tender|requisition)\b/.test(text);
  const budgetMatch = text.match(/(\d+(\.\d+)?)\s*m\b/) || text.match(/₦?\s*(\d{7,})/);
  const looksHighValue = Boolean(budgetMatch) && (
    text.includes('m') ? parseFloat(budgetMatch[1]) * 1000000 >= HIGH_VALUE_NGN_THRESHOLD
      : parseInt(budgetMatch[1], 10) >= HIGH_VALUE_NGN_THRESHOLD
  );

  if (mode === 'business' && mentionsBulk) return 'complex';
  if (looksHighValue) return 'complex';
  return 'quick';
};

const estimateCostUsd = (candidate, promptChars) => (promptChars / 1000) * candidate.costPer1kChars;

/**
 * Tries each candidate model for the classified tier, cheapest first,
 * skipping any provider without an API key configured. Falls back to the
 * next candidate on any error (timeout, rate limit, invalid response) so a
 * single provider outage never takes the feature down. Returns null when
 * every provider fails or none are configured — caller should fall back to
 * the deterministic local engine.
 */
export const routeQuery = async ({ prompt, imageBase64, mode, userId }) => {
  const tier = classifyTask({ prompt, imageBase64, mode });
  const candidates = MODEL_TIERS[tier].filter((c) => PROVIDERS[c.provider].isConfigured());

  if (candidates.length === 0) {
    return { result: null, tier, providerUsed: null, modelUsed: null };
  }

  const systemPrompt = buildSystemPrompt(mode);
  const promptChars = (prompt || '').length;

  for (const candidate of candidates) {
    try {
      const raw = await PROVIDERS[candidate.provider].generate({
        modelId: candidate.modelId,
        systemPrompt,
        userPrompt: prompt || 'Find best product match',
        imageBase64
      });
      const parsed = JSON.parse(extractJson(raw));
      const estimatedCostUsd = estimateCostUsd(candidate, promptChars);

      logUsage({ userId, tier, provider: candidate.provider, model: candidate.modelId, promptChars, estimatedCostUsd, succeeded: true });

      return {
        result: parsed,
        tier,
        providerUsed: candidate.provider,
        modelUsed: candidate.modelId,
        estimatedCostUsd
      };
    } catch (err) {
      console.warn(`[modelRouter] ${candidate.provider}/${candidate.modelId} failed:`, err.message);
      logUsage({ userId, tier, provider: candidate.provider, model: candidate.modelId, promptChars, estimatedCostUsd: 0, succeeded: false });
    }
  }

  return { result: null, tier, providerUsed: null, modelUsed: null };
};

// Some providers wrap JSON in prose or code fences despite instructions; be lenient.
const extractJson = (raw) => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1];
  const braceStart = raw.indexOf('{');
  const braceEnd = raw.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) return raw.slice(braceStart, braceEnd + 1);
  return raw;
};

const logUsage = ({ userId, tier, provider, model, promptChars, estimatedCostUsd, succeeded }) => {
  db.prepare(
    `INSERT INTO ai_usage_log (user_id, tier, provider, model, prompt_chars, estimated_cost_usd, succeeded)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(userId || null, tier, provider, model, promptChars, estimatedCostUsd, succeeded ? 1 : 0);
};

const buildSystemPrompt = (mode) => `You are Zibi, an AI-native procurement assistant for businesses and personal shopper for individuals.
Mode: ${mode === 'personal' ? 'Personal Shopper' : 'Corporate Procurement Officer'}
Your goal is to research products, compare specifications, evaluate trade-offs, identify prices across local (Nigeria - Jumia, Konga, local stores) and international (UK, US, Alibaba) retailers, and give clear buying recommendations.

Return your response in structured JSON format with this exact schema:
{
  "summary": "Brief natural language explanation of your research and recommendations",
  "items": [
    {
      "title": "Full product title and exact specs",
      "price": 1200000,
      "vendor": "Store name (e.g. Konga Direct, Jumia Official, Amazon UK)",
      "location": "Origin and delivery time (e.g. Lagos 1-Day, London 5-7 Days)",
      "specsNote": "Key performance or spec highlight",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Trade-off 1"],
      "isRecommended": true
    }
  ]
}`;
