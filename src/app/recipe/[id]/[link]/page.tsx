'use client';

import slugify from 'slugify';
import React, { useEffect,useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Badge, Button } from 'react-bootstrap';
import { Check, X } from 'lucide-react';
import NutritionAccordion from '@/components/recipes-components/NutritionAccordion';
import Loading from '@/components/home-components/Loading';
import {
    calculateTotalTime,
    getDifficulty,
    checkIngredients,
} from '@/utils/recipeUtils';
import { P } from 'framer-motion/dist/types.d-DsEeKk6G';

const RecipePage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [recipe, setRecipe] = useState<any>(null);
    const [userIngredients, setUserIngredients] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const res = await fetch(`/api/recipe/${params.id}`);
                if (!res.ok) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (!data || !data.recipe) {
                    setNotFound(true);
                } else {
                    setRecipe(data.recipe);
                    const expectedLink = slugify(data.recipe.name, { lower: true, strict: true });
                    if (params.link !== expectedLink) {
                        router.replace(`/recipe/${data.recipe.id}/${expectedLink}`);
                        return;
                    }
                }
            } catch (error) {
                console.error(error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    
        fetch('/api/user-ingredients')
            .then(res => res.json())
            .then(data => setUserIngredients(new Set(data.ingredientIds)));
    }, [params.id, params.link, router]);

    if (loading) {
        return <div className="min-h-screen d-flex justify-content-center align-items-center"><Loading /></div>;
    }

    if (notFound) {
        return <div className="min-h-screen d-flex justify-content-center align-items-center"><p>Recipe not found.</p></div>;
    }

    const difficulty = getDifficulty(recipe.difficulty);
    const totalTime = calculateTotalTime(recipe.prepTime, recipe.cookTime, recipe.downTime || 0);
    const { haveIngredients, missingIngredients, matchPercent } = checkIngredients(
        recipe.ingredients,
        userIngredients
    );

    const ingredientsList = recipe.ingredients.map((ri: { ingredient: { id: number; name: string }; quantity: number; unit: string }) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
        unit: ri.unit,
    }));

    return (
        <Container className="min-h-screen py-10">
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-4">
                    <h1 className="text-5xl font-bold">{recipe.name}</h1>
                    <Badge className="fs-6 py-1 px-3" bg={difficulty.variant}>{difficulty.label}</Badge>
                    <span className="text-muted">Match: {matchPercent.toFixed(0)}%</span>
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
                    {ingredientsList.map((ingredient: { id: number; name: string; quantity: number; unit: string }) => (
                        <li key={ingredient.id} className="flex items-center gap-2 list-item">
                            <span className="flex items-center gap-2">
                                {ingredient.quantity} {ingredient.unit.toLowerCase()} {ingredient.name}
                                <span
                                    className={`ms-2 ${userIngredients.has(ingredient.id) ? 'text-success' : 'text-danger'}`}
                                >
                                    {userIngredients.has(ingredient.id) ? <Check size={16} /> : <X size={16} />}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>

                <NutritionAccordion nutrition={recipe.nutrition} />

                <h3 className="text-2xl font-semibold pt-4">Instructions</h3>
                <div className="flex flex-col gap-4 pt-2">
                    {recipe.instructions
                        .sort((a: { step: number }, b: { step: number }) => a.step - b.step)
                        .map((instruction: { id: number; step: number; content: string }) => (
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