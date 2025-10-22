/* eslint-disable max-len */
'use client';

import slugify from 'slugify';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Badge, Button, Row, Col } from 'react-bootstrap';
import { Check, X } from 'lucide-react';
import StarRating from '@/components/recipes-components/StarRating';
import NutritionAccordion from '@/components/recipes-components/NutritionAccordion';
import CookingAlertModal from '@/components/cooking-components/CookingAlertModal';
import RecipeSkeleton from '@/components/recipes-components/RecipeSkeleton';
import { calculateTotalTime, getDifficulty, checkIngredients } from '@/utils/recipeUtils';
import ReviewSection from '@/components/recipes-components/ReviewSection';

const RecipePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [userIngredients, setUserIngredients] = useState<Set<number>>(new Set());
  const [showCookingAlert, setShowCookingAlert] = useState<boolean>(false);

  const navigateToCooking = () => {
    router.push(`/cooking/${recipe.id}/${slugify(recipe.name, { lower: true, strict: true })}`);
  };

  const handleConfirmCooking = () => {
    setShowCookingAlert(false);
    navigateToCooking();
  };

  const handleCloseAlert = () => {
    setShowCookingAlert(false);
  };

  const handleStartCooking = () => {
    const { missingIngredients } = checkIngredients(recipe.ingredients, userIngredients);
    if (missingIngredients.length > 0) setShowCookingAlert(true);
    else navigateToCooking();
  };

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
        if (!data?.recipe) {
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

    // --- safer fetch for user ingredients ---
    fetch('/api/user-ingredients')
      .then(async (res) => {
        if (!res.ok) return { ingredientIds: [] };
        const text = await res.text();
        if (!text) return { ingredientIds: [] };
        try {
          return JSON.parse(text);
        } catch {
          return { ingredientIds: [] };
        }
      })
      .then((data) => setUserIngredients(new Set(data.ingredientIds)))
      .catch(() => setUserIngredients(new Set()));

    fetchRecipe();
  }, [params.id, params.link, router]);

  if (loading) return <RecipeSkeleton />;

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
    <>
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
            <small className="text-muted">({recipe.reviewCount ?? 0})</small>
          </div>

          <span className="text-sm">
            By {recipe.user.username} | Posted on{' '}
            {new Date(recipe.postDate).toLocaleDateString()}
          </span>

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
                              <Check size={16} className="text-success" />
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
                              <X size={16} className="text-danger" />
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-muted small fst-italic ps-0 m-0">N/A</p>
                  )}
                </Col>
              </Row>

              <Button
                className="mt-1 mb-2"
                style={{ fontSize: '0.9rem', width: 300, height: 50 }}
                variant="secondary"
              >
                Add Missing Ingredients to Shopping List
              </Button>

              <NutritionAccordion nutrition={recipe.nutrition} />
            </Col>

            <Col>
              <h3 className="text-2xl font-semibold pt-4">Instructions</h3>
              <div className="flex flex-col gap-4 pt-2">
                {recipe.instructions
                  .sort((a: any, b: any) => a.step - b.step)
                  .map((instruction: any) => (
                    <div key={instruction.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-custom text-white flex items-center justify-center font-bold">
                        {instruction.step}
                      </div>
                      <p className="flex-1">{instruction.content}</p>
                    </div>
                  ))}
              </div>
              <Button
                className="mt-3"
                style={{ fontSize: '1rem', width: 250, height: 50 }}
                onClick={handleStartCooking}
                variant="success"
              >
                Start Cooking
              </Button>
            </Col>
          </Row>

          {/* ⭐ Review Section added here */}
          <ReviewSection recipeId={Number(params.id)} />
        </div>
      </Container>

      <CookingAlertModal
        show={showCookingAlert}
        onHide={handleCloseAlert}
        onConfirm={handleConfirmCooking}
        missingIngredientsCount={missingIngredients.length}
        totalIngredientsCount={recipe.ingredients.length}
      />
    </>
  );
};

export default RecipePage;
