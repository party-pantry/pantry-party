"use client";

import slugify from 'slugify';
import { useRouter } from 'next/navigation';
import { Recipe } from '@prisma/client';
import { Clock } from 'lucide-react';
import { Card, CardBody, CardTitle, CardText, Badge, Button } from 'react-bootstrap';

const difficultyMap = {
    EASY: { label: 'Easy', variant: 'success' },
    MEDIUM: { label: 'Medium', variant: 'warning' },
    HARD: { label: 'Hard', variant: 'danger' },
}

interface RecipeCardProps {
  recipe: Recipe & {
    ingredients: {
      ingredient: { id: number, name: string };
    }[];
  };
  userIngredientsId?: Set<number>
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, userIngredientsId }) => {
    const link = slugify(recipe.name, { lower: true, strict: true });
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/recipe/${recipe.id}/${link}`);
    };

    const difficulty = difficultyMap[recipe.difficulty]
    const totalTime = recipe.cookTime + recipe.prepTime + (recipe.downTime ?? 0);

    const haveIngredients = recipe.ingredients
        .filter(ri => userIngredientsId?.has(ri.ingredient.id))
        .map(ri => ri.ingredient.name);

    const missingIngredients = recipe.ingredients
        .filter(ri => !userIngredientsId?.has(ri.ingredient.id))
        .map(ri => ri.ingredient.name);

    const matchPercent = recipe.ingredients.length > 0
        ? Math.round((haveIngredients.length / recipe.ingredients.length) * 100)
        : 0;


    return (
        <Card className="recipe-card">
            <CardBody>
                <div className="recipe-card-title-container">
                    <CardTitle className="recipe-card-title">{recipe.name}</CardTitle>
                    <Badge bg={difficulty.variant}>{difficulty.label}</Badge>
                </div>
                
                <CardText className="recipe-card-description text-muted">{recipe.description}</CardText>
                <CardText className="recipe-card-time text-muted"><Clock size={15} />{totalTime} minutes</CardText>

                <CardText>
                    <strong>Ingredients You Have:</strong> {haveIngredients.join(', ') || 'None'}
                </CardText>
                <CardText>
                    <strong>Ingredients You're Missing:</strong> {missingIngredients.join(', ') || 'None'}
                </CardText>
                <CardText><strong>Match: {matchPercent}%</strong></CardText>

                <div className="recipe-card-view-cook-buttons">
                    <Button className="view-recipe-button" variant="success" onClick={handleViewDetails}>View Recipe</Button>
                    <Button className="start-cooking-button" variant="success">Start Cooking</Button>
                </div>
                <div className="recipe-card-missing-button">
                    <Button className="add-missing-ingredients-button" variant="outline-success">Add Missing Ingredients</Button>
                </div>
            </CardBody>
        </Card>
    );
};

export default RecipeCard;