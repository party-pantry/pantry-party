import React from 'react';
import slugify from 'slugify';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Container, Badge, Button } from 'react-bootstrap';
import NutritionAccordion from '@/components/recipes-components/NutritionAccordion';

interface RecipePageProps {
    params: { id: string, link: string }
}

const difficultyMap = {
  EASY: { label: 'Easy', variant: 'success' },
  MEDIUM: { label: 'Medium', variant: 'warning' },
  HARD: { label: 'Hard', variant: 'danger' },
};

const RecipePage: React.FC<RecipePageProps> = async ({ params }) => {
    const id = Number(params.id);

    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
            ingredients: { include: { ingredient: true } },
            instructions: true,
            nutrition: true,
            user: true,
        },
    });

    if (!recipe) {
        return <Container className="min-h-screen"><p>Recipe not found.</p></Container>;
    }

    const expectedLink = slugify(recipe.name, { lower: true, strict: true });
    if (params.link !== expectedLink) {
        return redirect(`/recipe/${recipe.id}/${expectedLink}`);
    }

    const totalTime = recipe.cookTime + recipe.prepTime + (recipe.downTime ?? 0);
    const difficulty = difficultyMap[recipe.difficulty];
    const ingredientsList = recipe.ingredients.map(ri => ({
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
    }));
    
    console.log(recipe.rating);

    return (
        <Container className="min-h-screen py-10">
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-4">
                    <h1 className="text-5xl font-bold">{recipe.name}</h1>
                    <Badge className="fs-6 py-1 px-3" bg={difficulty.variant}>{difficulty.label}</Badge>
                    {/* Placeholder for match percentage */}
                    <span className="text-muted">Match: N/A%</span>
                </div>
                <p className="text-sm m-0">By {recipe.user.username}</p>
                <hr className="my-4 w-100" />
                <p className="text-lg">{recipe.description}</p>

                <div className="flex justify-between w-full max-w-xl">
                    {[
                        { label: 'Prep Time', value: recipe.prepTime + " mins" },
                        { label: 'Cook Time', value: recipe.cookTime + " mins" },
                        { label: 'Down Time', value: (recipe.downTime ?? 0) + " mins" },
                        { label: 'Total Time', value: totalTime + " mins" },
                        { label: 'Servings', value: recipe.servings },
                    ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center">
                           <span className="font-bold text-xl">{item.value}</span>
                           <span className="text-sm text-gray-600">{item.label}</span>
                        </div>
                  ))}
                </div>
                
                <h3 className="text-2xl font-semibold pt-4">Ingredients</h3>
                <ul className="list-disc pl-6 space-y-1">
                    {ingredientsList.map((ingredient, index) => (
                        <li key={index}>
                            {ingredient.quantity} {ingredient.unit.toLowerCase()} {ingredient.name}
                        </li>
                    ))}
                </ul>

                <NutritionAccordion nutrition={recipe.nutrition} />

                <h3 className="text-2xl font-semibold pt-4">Instructions</h3>
                <div className="flex flex-col gap-4 pt-2">
                    {recipe.instructions
                        .sort((a, b) => a.step - b.step)
                        .map((instruction) => (
                            <div key={instruction.id} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-custom text-white flex items-center justify-center font-bold">
                                    {instruction.step}
                                </div>
                            <p className="flex-1">{instruction.content}</p>
                            </div>
                    ))}
                </div>
                <div className="flex gap-15 pt-6">
                    <Button style={{ width: 250, height: 50 }} variant="success">Start Cooking</Button>
                    <Button style={{ width: 250, height: 50 }} variant="outline-success">Add Missing Ingredients to Cart</Button>
                </div>
            </div>
        </Container>
    );
};

export default RecipePage;