import { Router } from 'express';
import { routeQuery } from '../services/modelRouter.service.js';
import { runFallbackEngine } from '../services/fallbackEngine.service.js';
import { withProductImages } from '../services/productImages.service.js';

export const aiRouter = Router();

// Guest-accessible: chat/search is the core product experience and shouldn't
// require an account. req.user (if present, via attachUser) is used only to
// attribute AI spend in ai_usage_log for cost reporting.
aiRouter.post('/query', async (req, res) => {
  const { prompt, imageBase64, mode } = req.body || {};

  const routed = await routeQuery({ prompt, imageBase64, mode, userId: req.user?.id });

  if (routed.result) {
    return res.json({
      text: routed.result.summary || 'I analyzed the market and retrieved the following product specs:',
      type: 'comparison',
      items: withProductImages(routed.result.items),
      isLiveAI: true,
      providerUsed: routed.providerUsed,
      modelUsed: routed.modelUsed,
      tier: routed.tier
    });
  }

  const fallback = runFallbackEngine(prompt, mode);
  res.json({
    ...fallback,
    items: withProductImages(fallback.items),
    isLiveAI: false,
    providerUsed: null,
    modelUsed: null,
    tier: routed.tier
  });
});
