import { prisma } from '@/lib/prisma';
import React from 'react';
import { Container, Button, Badge,} from 'react-bootstrap';

interface RecipePageProps {
    params: { slug: string }
}

const difficultyMap = {
  EASY: { label: 'Easy', variant: 'success' },
  MEDIUM: { label: 'Medium', variant: 'warning' },
  HARD: { label: 'Hard', variant: 'danger' },
};

const RecipePage: React.FC<RecipePageProps> = async ({ params }) => {
    const { slug } = params;
    const id = Number(slug.split('-').pop());

    const recipe = await prisma.recipe.findUnique({
        where: { id: Number(id) },
            include: {
                ingredients: { include: { ingredient: true } },
            },
        });

    if (!recipe) {
        return <Container><p>Recipe not found.</p></Container>;
    }

    const totalTime = recipe.cookTime + recipe.prepTime + (recipe.downTime ?? 0);
    const difficulty = difficultyMap[recipe.difficulty];
    const ingredientsList = recipe.ingredients.map(ri => ri.ingredient.name);
    
    return (
        <Container style={{ marginBottom: 50, minHeight: '100vh'}}>
        <div
            style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            height: '100vh',
            marginBottom: '5px',
            }}
        >
            <h1>{recipe.name}</h1>
            <p>{recipe.description}</p>
            <p>Total Time: {totalTime} minutes</p>
            <p>Difficulty: <Badge bg={difficulty.variant}>{difficulty.label}</Badge></p>
            <h3>Ingredients:</h3>
            <ul>
                {ingredientsList.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        </div>
        </Container>
    );
};

export default RecipePage;