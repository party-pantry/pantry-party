/* eslint-disable max-len */
import React from 'react';
import { Button, Card, Form, Badge } from 'react-bootstrap';
import { Check } from 'lucide-react';

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
    <Card className="h-100">
      <Card.Header className="bg-primary text-white">
        <h4 className="mb-0">Recipe Ingredients</h4>
        <small>Check off ingredients as you prepare them</small>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <div className="flex-grow-1">
          <div className="mb-3">
            <Badge bg={isAllIngredientsChecked ? 'success' : 'primary'}>
              {checkedIngredients.size} / {ingredients?.length || 0} prepared
            </Badge>
          </div>

          <div className="ingredient-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {ingredients?.map((recipeIngredient) => {
              const isChecked = checkedIngredients.has(recipeIngredient.ingredient.id);

              return (
                <div
                  key={recipeIngredient.ingredient.id}
                  className="mb-2 p-3 border rounded d-flex align-items-center justify-content-between"
                  style={{
                    backgroundColor: isChecked ? '#f8f9fa' : 'white',
                    borderColor: '#28a745',
                  }}
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
                  <div className="d-flex align-items-center gap-2">
                    <Check size={20} className="text-success" />
                    <small className="text-muted">Available</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="outline-primary"
            onClick={onNext}
            size="lg"
          >
            Skip to Cooking →
          </Button>
          <Button
            variant="success"
            onClick={onNext}
            disabled={!isAllIngredientsChecked}
            size="lg"
          >
            All Set, Start Cooking →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default IngredientsChecker;
