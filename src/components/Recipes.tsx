/* eslint-disable max-len */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import Loading from './home-components/Loading';
import RecipeCard from './recipes-components/RecipeCard';
import RecipesSearch from './recipes-components/RecipesSearch';
import RecipesFilterButton from './recipes-components/RecipesFilterButton';
import ToggleReceipesCanMake from './recipes-components/ToggleRecepiesCanMake';
import RecipesSortButton from './recipes-components/RecipesSortButton';
import AddRecipesModal from './recipes-components/AddRecipesModal';
import { checkIngredients } from '../utils/recipeUtils';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number, name: string };
  }[];
}

const Recipes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredientsId, setUserIngredientsId] = useState<Set<number>>(new Set());
  const [canMakeOnly, setCanMakeOnly] = useState(false);

  // Add filters state
  const [filters, setFilters] = useState<{
    difficulty: string[];
    totalTime: string[];
    servings: string[];
    rating: string[];
  }>({
    difficulty: [],
    totalTime: [],
    servings: [],
    rating: [],
  });

  // Filter the recipes by ingredients available AND applied filters
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by "can make only"
    if (canMakeOnly) {
      filtered = filtered.filter(recipe => {
        const { missingIngredients } = checkIngredients(recipe.ingredients, userIngredientsId);
        return missingIngredients.length === 0;
      });
    }

    // Filter by difficulty
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(recipe => {
      // Convert filter values to uppercase to match database enum
        const upperCaseDifficulties = filters.difficulty.map(d => d.toUpperCase());
        return upperCaseDifficulties.includes(recipe.difficulty);
      });
    }

    // Filter by total time (prepTime + cookTime + downTime)
    if (filters.totalTime.length > 0) {
      filtered = filtered.filter(recipe => {
      // Calculate total time from prepTime, cookTime, and downTime
        const totalTime = recipe.prepTime + recipe.cookTime + (recipe.downTime || 0);

        return filters.totalTime.some((timeRange) => {
          if (timeRange === '< 30 mins') return totalTime < 30;
          if (timeRange === '30 - 60 mins') return totalTime >= 30 && totalTime <= 60;
          if (timeRange === '> 60 mins') return totalTime > 60;
          return false;
        });
      });
    }

    // Filter by servings
    if (filters.servings.length > 0) {
      filtered = filtered.filter(recipe => filters.servings.some((servingRange) => {
        if (servingRange === '1-2') return recipe.servings >= 1 && recipe.servings <= 2;
        if (servingRange === '3-4') return recipe.servings >= 3 && recipe.servings <= 4;
        if (servingRange === '5+') return recipe.servings >= 5;
        return false;
      }));
    }

    // Filter by rating
    if (filters.rating.length > 0) {
      filtered = filtered.filter(recipe => filters.rating.some((ratingOption) => {
        const minRating = parseInt(ratingOption.charAt(0), 10);
        return recipe.rating >= minRating;
      }));
    }

    return filtered;
  }, [recipes, userIngredientsId, canMakeOnly, filters]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes');
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.recipes || data.recipes.length === 0) {
          setNotFound(true);
        } else {
          setRecipes(data.recipes);
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserIngredients = async () => {
      const res = await fetch('/api/user-ingredients');
      const data = await res.json();
      setUserIngredientsId(new Set(data.ingredientIds));
    };

    fetchRecipes();
    fetchUserIngredients();
  }, []);

  if (loading) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><Loading /></div>;
  }

  if (notFound) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><p>Recipe not found.</p></div>;
  }

  return (
      <Container className="mb-12 min-h-screen mt-5">
        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
          <RecipesSearch />
          <RecipesFilterButton onApply={setFilters} />
          <RecipesSortButton />
        </div>
        <div className="d-flex justify-content-end flex-wrap gap-2 mb-2 align-items-center">
          <ToggleReceipesCanMake onToggleCanMake={setCanMakeOnly} />
          <AddRecipesModal />
        </div>

        <Row className="g-4 justify-content-center">
          {filteredRecipes.map(recipe => (
            <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
              <RecipeCard recipe={recipe} userIngredientsId={userIngredientsId} />
            </Col>
          ))}
        </Row>
      </Container>
  );
};

export default Recipes;