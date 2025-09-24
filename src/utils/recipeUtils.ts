// Recipe types and utilities

export type Recipe = {
  id: number;
  name: string;
  image: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  availableIngredients: string[];
  missingIngredients: string[];
  description: string;
  servings?: number;
  prepTime?: string;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  nutritionInfo?: NutritionInfo;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
  unit: string;
  available: boolean;
};

export type NutritionInfo = {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
};

// Bootstrap variant mapping for difficulty levels
export const getDifficultyVariant = (difficulty: Recipe['difficulty']): string => {
  const difficultyMap = {
    Easy: 'success',
    Medium: 'warning',
    Hard: 'danger',
  } as const;
  return difficultyMap[difficulty];
};

// Calculate recipe match percentage
export const getMatchPercentage = (recipe: Recipe): number => {
  const total = recipe.availableIngredients.length + recipe.missingIngredients.length;
  return Math.round((recipe.availableIngredients.length / total) * 100);
};
