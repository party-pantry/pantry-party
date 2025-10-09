/* eslint-disable max-len */
import React from 'react';
import { Button, Card, Form, Badge } from 'react-bootstrap';

interface Ingredient {
  id: number;
  name: string;
}

interface RecipeIngredient {
  ingredient: Ingredient;
  quantity: string;
  unit: string;
}

interface IngredientsCheckerProps {
  ingredients: RecipeIngredient[];
  checkedIngredients: Set<number>;
  onIngredientCheck: (ingredientId: number) => void;
  onNext: () => void;
}

const IngredientsChecker: React.FC<IngredientsCheckerProps> = ({
  ingredients,
  checkedIngredients,
  onIngredientCheck,
  onNext,
}) => {
  const isAllIngredientsChecked = checkedIngredients.size === ingredients?.length;

  return (
    <Card className="mb-3 d-flex flex-column"
      style={{
        minHeight: '40vh',
        maxHeight: '60vh',
      }}
    >
      <Card.Header className="bg-success-custom text-white py-3 d-flex flex-column align-items-start justify-content-center">
        <h4 className="mb-1">Ingredients Check</h4>
        <small>Check off ingredients as you prepare them</small>
      </Card.Header>

      <Card.Body className="d-flex flex-column flex-grow-1 overflow-hidden"
        style={{ height: 'calc(60vh - 56px)' }}
      >
          <div className="mb-3">
            <Badge bg='success-custom'>
              {checkedIngredients.size} / {ingredients?.length || 0} prepared
            </Badge>
          </div>

          <div
            className="flex-grow-1 border rounded p-3 overflow-y-auto"
            style={{ minHeight: 0 }}
          >
            {ingredients?.map((recipeIngredient) => {
              const isChecked = checkedIngredients.has(recipeIngredient.ingredient.id);
              return (
                <div
                  key={recipeIngredient.ingredient.id}
                  className="mb-2 p-2 d-flex align-items-center gap-3 border rounded"
                >
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <Form.Check
                      type="checkbox"
                      id={`ingredient-${recipeIngredient.ingredient.id}`}
                      checked={isChecked}
                      onChange={() => onIngredientCheck(recipeIngredient.ingredient.id)}
                    />
                    <span className={isChecked ? 'text-decoration-line-through text-muted' : ''}>
                      <strong>{recipeIngredient.quantity} {recipeIngredient.unit.toLowerCase()}</strong> {recipeIngredient.ingredient.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="success"
            onClick={onNext}
            disabled={!isAllIngredientsChecked}
          >
            Start Cooking
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default IngredientsChecker;
