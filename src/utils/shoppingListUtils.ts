// Utility functions for shopping list functionality

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: string;
  category: 'Produce' | 'Meat' | 'Dairy' | 'Frozen' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  purchased: boolean;
  addedDate: string;
};

// Bootstrap variant mapping for priorities
export const getPriorityVariant = (
  priority: ShoppingItem['priority'],
): string => {
  const priorityMap = {
    High: 'danger',
    Medium: 'warning',
    Low: 'secondary',
  } as const;
  return priorityMap[priority];
};

// Bootstrap variant mapping for categories
export const getCategoryVariant = (
  category: ShoppingItem['category'],
): string => {
  const categoryMap = {
    Produce: 'category-produce',
    Meat: 'category-meat',
    Dairy: 'category-dairy',
    Frozen: 'category-frozen',
    Other: 'category-other',
  } as const;
  return categoryMap[category];
};

// Reusable sorting utility for shopping items by priority
export const sortItemsByPriority = (items: ShoppingItem[]): ShoppingItem[] => {
  const priorityOrder = { High: 3, Medium: 2, Low: 1 } as const;
  return [...items].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
  );
};
