/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

'use client';

import slugify from 'slugify';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Badge, Button, Row, Col } from 'react-bootstrap';
import { Check, X } from 'lucide-react';
import StarRating from '@/components/recipes-components/StarRating';
import NutritionAccordion from '@/components/recipes-components/NutritionAccordion';
import Loading from '@/components/home-components/Loading';
import {
  calculateTotalTime,
  getDifficulty,
  checkIngredients,
} from '@/utils/recipeUtils';

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
    return (
        <div className="min-h-screen d-flex justify-content-center align-items-center">
            <Loading />
        </div>
    );
  }

  if (notFound) {
    return (
        <div className="min-h-screen d-flex justify-content-center align-items-center">
            <p>Recipe not found.</p>
        </div>
    );
  }

  const difficulty = getDifficulty(recipe.difficulty);

  const totalTime = calculateTotalTime(recipe.prepTime, recipe.cookTime, recipe.downTime || 0);
  
  const { haveIngredients, missingIngredients, matchPercent } = checkIngredients(
    recipe.ingredients,
    userIngredients,
  );

  return (
        <Container className="min-h-screen py-10">
            <div className="flex flex-col items-start gap-1">
              
                <div className="flex items-center gap-4">
                    <h1 className="text-5xl font-bold m-0">{recipe.name}</h1>
                    <Badge className="fs-6 py-1 px-3" bg={difficulty.variant}>{difficulty.label}</Badge>
                    <span className="text-muted">Ingredients Match: {matchPercent.toFixed(0)}%</span>
                </div>

                <div className="d-flex align-items-center gap-2 mt-1 mb-1">
                  <StarRating rating={recipe.rating} size={20} />
                  <span className="text-muted">{recipe.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm">By {recipe.user.username} | Posted on {new Date(recipe.postDate).toLocaleDateString()}</span>

                <hr className="my-4 w-100" />

                <Row className="gap-5 w-100">
                    <Col>
                        <p className="text-lg">{recipe.description}</p>
                        <div className="flex justify-between w-full max-w-xl">
                            {[
                              { label: 'Prep Time', value: `${recipe.prepTime} mins` },
                              { label: 'Cook Time', value: `${recipe.cookTime} mins` },
                              { label: 'Down Time', value: `${recipe.downTime ?? 0} mins` },
                              { label: 'Total Time', value: `${totalTime} mins` },
                              { label: 'Servings', value: recipe.servings },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center">
                                    <span className="font-bold text-xl">{item.value}</span>
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-2xl font-semibold pt-4">Ingredients</h3>

                        <Row className="w-100">
                          <Col md={6} sm={12}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <h6 className="fw-semi-bold m-0">Available:</h6>
                            </div>

                            {haveIngredients.length > 0 ? (
                              <ul className="list-disc ps-4">
                                {recipe.ingredients
                                  .filter((ri: any) => userIngredients.has(ri.ingredient.id))
                                  .map((ri: any) => (
                                    <li key={ri.ingredient.id} className="mb-1 list-item">
                                      <span className="d-inline-flex align-items-center gap-1">
                                        {ri.quantity} {ri.unit.toLowerCase()} {ri.ingredient.name}
                                        <Check size={16} className="text-success" style={{ width: 16, height: 16, flexShrink: 0 }} />
                                      </span>
                                    </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted small fst-italic ps-0 m-0">N/A</p>
                            )}
                          </Col>
                          
                          <Col md={6} sm={12}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <h6 className="fw-semi-bold m-0">Missing:</h6>
                            </div>

                            {missingIngredients.length > 0 ? (
                              <ul className="list-disc ps-4">
                                {recipe.ingredients
                                  .filter((ri: any) => !userIngredients.has(ri.ingredient.id))
                                  .map((ri: any) => (
                                    <li key={ri.ingredient.id} className="mb-1 list-item">
                                      <span className="d-inline-flex align-items-center gap-1">
                                        {ri.quantity} {ri.unit.toLowerCase()} {ri.ingredient.name}
                                        <X size={16} className="text-danger" style={{ width: 16, height: 16, flexShrink: 0 }} />
                                      </span>
                                    </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted small fst-italic ps-0 m-0">N/A</p>
                            )}
                          </Col>
                        </Row>

                        <Button className="mt-1 mb-2" style={{ width: 250, height: 50 }} variant="outline-success">Add Missing Ingredients to Cart</Button>
                        
                        <NutritionAccordion nutrition={recipe.nutrition} />
                    </Col>

                    <Col>
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
                        <Button className="mt-3" style={{ width: 250, height: 50 }} variant="success">Start Cooking</Button>
                    </Col>
                </Row>
            </div>
        </Container>
  );
};

export default RecipePage;
