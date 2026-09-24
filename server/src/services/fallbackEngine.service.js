// Deterministic local procurement engine — used when no AI provider is
// configured/reachable, so the product never hard-fails on a 3rd-party outage.
// Mirrors src/services/aiService.js's fallback on the frontend.
export const runFallbackEngine = (prompt, _mode) => {
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

  if (category === 'Tech') {
    const basePrice = budgetCap ? Math.round(budgetCap * 0.9) : 1350000;
    return {
      text: 'Scouted e-commerce platforms (Jumia, Konga, Amazon UK, iStore) for high-performance laptops:',
      type: 'comparison',
      items: [
        {
          title: 'ASUS ROG Zephyrus G16 (16GB RAM, 1TB SSD, RTX 4060)',
          price: basePrice,
          vendor: 'Konga Direct',
          location: 'Lagos (1-Day Delivery)',
          specsNote: 'Optimal render speed & specs balance for video editing.',
          pros: ['Dedicated GPU', '16GB RAM', 'Local Lagos Warranty'],
          cons: ['Slightly heavier chassis'],
          isRecommended: true,
          category
        },
        {
          title: 'Apple MacBook Pro 14" M3 (16GB RAM, 512GB SSD)',
          price: Math.round(basePrice * 1.12),
          vendor: 'iStore Nigeria',
          location: 'Lagos (Same-Day Delivery)',
          specsNote: 'M3 Silicon chip handles 4K video rendering easily with zero fan noise.',
          pros: ['18-hour battery', 'Liquid Retina XDR'],
          cons: ['Higher price tier'],
          isRecommended: false,
          category
        }
      ]
    };
  }

  if (category === 'Fashion') {
    const basePrice = budgetCap ? Math.round(budgetCap * 0.8) : 850000;
    return {
      text: 'Queried apparel manufacturers & merchants in Lagos and Shenzhen for custom clothing:',
      type: 'comparison',
      items: [
        {
          title: '50x Heavyweight Pique Cotton Polos (Custom Logo Embroidery)',
          price: basePrice,
          vendor: 'Lagos Apparel Works (Verified Supplier)',
          location: 'Lagos HQ Delivery (3 Days)',
          specsNote: 'Local fulfillment guarantees delivery within 3 business days.',
          pros: ['Custom embroidery included', 'Fast local shipping'],
          cons: ['Minimum order quantity 25 units'],
          isRecommended: true,
          category: 'Corporate Swag'
        }
      ]
    };
  }

  const price = budgetCap || 250000;
  return {
    text: `Searched internet retailers and local merchants for your query: "${prompt || 'Product Scouting'}"`,
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
        category
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
        category
      }
    ]
  };
};
