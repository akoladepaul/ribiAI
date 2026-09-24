import { describe, it, expect } from 'vitest';
import {
  mapItemCategoryToPermissionKey,
  shouldAutoApprove,
  calculateUsagePercent,
  findMatchingBudget
} from './permissions';

describe('mapItemCategoryToPermissionKey', () => {
  it('maps known display categories to permission keys', () => {
    expect(mapItemCategoryToPermissionKey('Tech')).toBe('electronics');
    expect(mapItemCategoryToPermissionKey('Corporate Swag')).toBe('b2b_bulk');
  });

  it('returns null for unknown or missing categories', () => {
    expect(mapItemCategoryToPermissionKey('Snacks')).toBeNull();
    expect(mapItemCategoryToPermissionKey(undefined)).toBeNull();
  });
});

describe('shouldAutoApprove', () => {
  const permissions = {
    autoApproveLimit: 50000,
    requireApprovalAbove: 100000,
    requireApprovalCategories: ['electronics', 'luxury']
  };

  it('auto-approves cheap items outside restricted categories', () => {
    expect(shouldAutoApprove({ price: 20000, category: 'Groceries' }, permissions)).toBe(true);
  });

  it('rejects items above the auto-approve limit', () => {
    expect(shouldAutoApprove({ price: 60000, category: 'Groceries' }, permissions)).toBe(false);
  });

  it('rejects cheap items in a restricted category', () => {
    expect(shouldAutoApprove({ price: 10000, category: 'Tech' }, permissions)).toBe(false);
  });

  it('rejects anything above the mandatory approval threshold regardless of category', () => {
    expect(shouldAutoApprove({ price: 200000, category: 'Groceries' }, permissions)).toBe(false);
  });
});

describe('calculateUsagePercent', () => {
  it('computes a rounded percentage', () => {
    expect(calculateUsagePercent(50, 200)).toBe(25);
  });

  it('returns 0 instead of NaN/Infinity when allocated is 0', () => {
    expect(calculateUsagePercent(50, 0)).toBe(0);
  });
});

describe('findMatchingBudget', () => {
  const budgets = [
    { id: 'b-1', category: 'Tech & Gadgets', mode: 'personal', allocated: 100, spent: 0 },
    { id: 'b-2', category: 'IT & Equipment (Office)', mode: 'business', allocated: 100, spent: 0 }
  ];

  it('finds a budget in the same mode whose category overlaps the item category', () => {
    expect(findMatchingBudget(budgets, 'personal', 'Tech')?.id).toBe('b-1');
  });

  it('returns null when nothing matches', () => {
    expect(findMatchingBudget(budgets, 'personal', 'Furniture')).toBeNull();
  });
});
