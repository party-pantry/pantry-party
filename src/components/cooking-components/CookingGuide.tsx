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
}

const CookingGuide: React.FC<CookingGuideProps> = ({ recipe }) => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
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

  const handleNext = () => {
    if (currentStep === -1) {
      setCurrentStep(0);
    } else if (currentStep < sortedInstructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 0) {
      setCurrentStep(-1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
};

export default CookingGuide;
