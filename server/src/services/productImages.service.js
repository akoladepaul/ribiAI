// Curated, verified-working Unsplash photos keyed by product category.
// AI providers never return image URLs (a model can't be trusted not to
// hallucinate a broken link for a specific SKU), so every item gets matched
// to a representative category photo server-side instead.
const CATEGORY_IMAGES = {
  tech: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
  furniture: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60',
  fashion: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
  'corporate swag': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
  health: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=60'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

export const getProductImage = (category) => {
  if (!category) return DEFAULT_IMAGE;
  return CATEGORY_IMAGES[category.trim().toLowerCase()] || DEFAULT_IMAGE;
};

export const withProductImages = (items = []) =>
  items.map((item) => ({ ...item, image: item.image || getProductImage(item.category) }));
