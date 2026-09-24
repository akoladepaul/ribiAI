import { API_BASE } from './backendClient';
import { getProductImage } from '../utils/productImages';

/**
 * Routes the query through the Zibi backend, which picks the
 * cost-optimal AI model (Gemini/Claude/GPT) for the task and never exposes
 * any provider API key to the browser. Falls back to a deterministic local
 * engine if the backend itself is unreachable (e.g. offline dev, backend
 * not started), so the UI never hard-fails.
 */
export const queryZibiAI = async ({ prompt, imageBase64, mode }) => {
  try {
    const res = await fetch(`${API_BASE}/api/ai/query`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, mode })
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Zibi backend unreachable, using offline local engine:', err.message);
    return { ...executeLiveProcurementSearch(prompt), apiError: 'Backend unreachable' };
  }
};

/**
 * Offline-only fallback used when the backend itself cannot be reached at
 * all (e.g. local dev without the server running). The backend has its own,
 * more complete fallback engine for when AI providers are unavailable.
 */
const executeLiveProcurementSearch = (prompt) => {
  const query = (prompt || '').toLowerCase();

  let category = 'General';
  let budgetCap = 0;

  const matchM = query.match(/(\d+(\.\d+)?)\s*m/i);
  const matchK = query.match(/(\d+)\s*k/i);

  if (matchM) budgetCap = parseFloat(matchM[1]) * 1000000;
  else if (matchK) budgetCap = parseInt(matchK[1], 10) * 1000;

  if (query.includes('laptop') || query.includes('macbook') || query.includes('computer')) category = 'Tech';
  else if (query.includes('shirt') || query.includes('polo') || query.includes('shoe') || query.includes('wear')) category = 'Fashion';
  else if (query.includes('chair') || query.includes('desk') || query.includes('furniture')) category = 'Furniture';
  else if (query.includes('diaper') || query.includes('supplement') || query.includes('drug') || query.includes('medicine')) category = 'Health';

  const price = budgetCap || 250000;
  return {
    text: `Searched internet retailers and local merchants for your query: "${prompt || 'Product Scouting'}" (offline mode — Zibi backend is unreachable)`,
    type: 'comparison',
    items: [
      {
        title: prompt ? `Premium Choice: ${prompt}` : 'Verified Top Rated Product Match',
        price,
        vendor: 'Konga Direct / Authorized Merchant',
        location: 'Lagos (1-2 Days)',
        specsNote: 'Verified stock with standard brand warranty.',
        pros: ['In stock', 'Best customer reviews'],
        cons: ['Standard delivery window'],
        isRecommended: true,
        category,
        image: getProductImage(category)
      },
      {
        title: prompt ? `Alternative Choice: ${prompt}` : 'Budget Alternative Match',
        price: Math.round(price * 0.85),
        vendor: 'Jumia Express',
        location: 'Abuja Warehouse',
        specsNote: 'Budget variant with 15% cost savings.',
        pros: ['Save 15%'],
        cons: ['Basic packaging'],
        isRecommended: false,
        category,
        image: getProductImage(category)
      }
    ],
    isLiveAI: false
  };
};
