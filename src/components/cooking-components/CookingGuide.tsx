/* eslint-disable max-len */
import React, { useState } from 'react';
import IngredientsChecker from './IngredientsChecker';
import CookingInstructions from './CookingInstructions';

interface Ingredient {
  id: number;
  name: string;
}

interface RecipeIngredient {
  ingredient: Ingredient;
  quantity: string;
  unit: string;
}

interface Instruction {
  id: number;
  step: number;
  content: string;
}

interface Recipe {
  id: number;
  name: string;
  instructions: Instruction[];
  ingredients: RecipeIngredient[];
}

interface CookingGuideProps {
  recipe: Recipe;
  currentStep: number;
  onStepChange: (step: number) => void;
}

const CookingGuide: React.FC<CookingGuideProps> = ({ recipe, currentStep, onStepChange }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const sortedInstructions = recipe.instructions?.sort((a, b) => a.step - b.step) || [];

  const handleIngredientCheck = (ingredientId: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientId)) {
      newChecked.delete(ingredientId);
    } else {
      newChecked.add(ingredientId);
    }
    setCheckedIngredients(newChecked);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onStepChange(-1);
    } else if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === -1) {
      onStepChange(0);
    } else if (currentStep < sortedInstructions.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  if (currentStep === -1) {
    return (
      <IngredientsChecker
        ingredients={recipe.ingredients}
        checkedIngredients={checkedIngredients}
        onIngredientCheck={handleIngredientCheck}
        onNext={handleNext}
      />
    );
  }

  return (
    <CookingInstructions
      instructions={recipe.instructions}
      currentStep={currentStep}
      onBack={handleBack}
      onNext={handleNext}
    />
  );
};

export default CookingGuide;
