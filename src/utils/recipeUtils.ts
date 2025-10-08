export const difficultyMap = {
  EASY: { label: 'Easy', variant: 'success' as const },
  MEDIUM: { label: 'Medium', variant: 'warning' as const },
  HARD: { label: 'Hard', variant: 'danger' as const },
};

export interface IngredientChecker {
  haveIngredients: string[];
  missingIngredients: string[];
  matchPercent: number;
}

export interface RecipeIngredient {
  ingredient: { id: number, name: string };
}

export const calculateTotalTime = (
  prepTime: number,
  cookTime: number,
  downTime?: number,
): number => prepTime + cookTime + (downTime ?? 0);

export const getDifficulty = (difficulty: keyof typeof difficultyMap) => difficultyMap[difficulty];

export const checkIngredients = (
  recipeIngredients: RecipeIngredient[],
  userIngredientsId?: Set<number>,
): IngredientChecker => {
  if (!userIngredientsId || userIngredientsId.size === 0) {
    return {
      haveIngredients: [],
      missingIngredients: recipeIngredients.map(ri => ri.ingredient.name),
      matchPercent: 0,
    };
  }

  const haveIngredients = recipeIngredients
    .filter(ri => userIngredientsId.has(ri.ingredient.id))
    .map(ri => ri.ingredient.name);

  const missingIngredients = recipeIngredients
    .filter(ri => !userIngredientsId.has(ri.ingredient.id))
    .map(ri => ri.ingredient.name);

  const matchPercent = Math.round((haveIngredients.length / recipeIngredients.length) * 100);

  return {
    haveIngredients,
    missingIngredients,
    matchPercent,
  };
};
