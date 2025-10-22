// Utility functions for shopping list functionality
import { LocalFoodCategory } from "@/lib/Units";

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: string;
  category: LocalFoodCategory;
  priority: 'High' | 'Medium' | 'Low';
  purchased: boolean;
  price?: number;
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
  category: LocalFoodCategory,
): string => {
  const categoryMap: Record<LocalFoodCategory, string> = {
    [LocalFoodCategory.PRODUCE]: 'category-produce',
    [LocalFoodCategory.MEAT]: 'category-meat',
    [LocalFoodCategory.DAIRY]: 'category-dairy',
    [LocalFoodCategory.FROZEN]: 'category-frozen',
    [LocalFoodCategory.OTHER]: 'category-other',
  };
  return categoryMap[category];
};

// Reusable sorting utility for shopping items by priority
export const sortItemsByPriority = (items: ShoppingItem[]): ShoppingItem[] => {
  const priorityOrder = { High: 3, Medium: 2, Low: 1 } as const;
  return [...items].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
  );
};
