// Maps a product's freeform display category (as returned by the AI/mock
// engine, e.g. "Tech", "Corporate Swag") to the permission-rule category ids
// configured in AppContext (e.g. "electronics", "b2b_bulk", "luxury").
const CATEGORY_MAP = {
  tech: 'electronics',
  electronics: 'electronics',
  'corporate swag': 'b2b_bulk',
  'b2b procurement': 'b2b_bulk',
  furniture: 'b2b_bulk',
  jewelry: 'luxury',
  luxury: 'luxury'
};

export const mapItemCategoryToPermissionKey = (category) => {
  if (!category) return null;
  return CATEGORY_MAP[category.trim().toLowerCase()] || null;
};

/**
 * Decides whether a procurement request can be executed autonomously
 * (no human-in-the-loop approval modal) given the current permission rules.
 */
export const shouldAutoApprove = (item, permissions) => {
  if (!item || !permissions) return false;

  const price = Number(item.price) || 0;
  const permissionKey = mapItemCategoryToPermissionKey(item.category);

  if (permissionKey && permissions.requireApprovalCategories?.includes(permissionKey)) {
    return false;
  }

  if (price > permissions.requireApprovalAbove) return false;

  return price <= permissions.autoApproveLimit;
};

export const calculateUsagePercent = (spent, allocated) => {
  const allocatedNum = Number(allocated) || 0;
  if (allocatedNum <= 0) return 0;
  return Math.round((Number(spent) || 0) / allocatedNum * 100);
};

/**
 * Finds the best-matching budget (same operating mode, closest category
 * name overlap) for a completed order, so its `spent` total can be updated.
 * Returns null when nothing matches closely enough to be trusted.
 */
export const findMatchingBudget = (budgets, mode, itemCategory) => {
  if (!itemCategory) return null;
  const candidates = budgets.filter((b) => b.mode === mode);
  const needle = itemCategory.trim().toLowerCase();

  return (
    candidates.find((b) => b.category.toLowerCase().includes(needle)) ||
    candidates.find((b) => needle.includes(b.category.toLowerCase().split(' ')[0])) ||
    null
  );
};
