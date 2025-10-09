/* eslint-disable no-case-declarations */
/* eslint-disable max-len */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Placeholder } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
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

// Loading Skeleton Component
const RecipesSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5">
    {/* Filter and Search Bar Skeleton */}
    <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
      <Placeholder as="div" animation="glow" style={{ width: '250px' }}>
        <Placeholder xs={12} style={{ height: '38px', borderRadius: '4px' }} />
      </Placeholder>
      <Placeholder.Button variant="outline-dark" xs={2} />
      <Placeholder.Button variant="outline-dark" xs={2} />
    </div>

    {/* Toggle and Add Button Skeleton */}
    <div className="d-flex justify-content-end flex-wrap gap-2 mb-2 align-items-center">
      <Placeholder.Button variant="outline-secondary" xs={3} />
      <Placeholder.Button variant="success" xs={3} />
    </div>

    {/* Recipe Cards Skeleton */}
    <Row className="g-4 justify-content-center">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Col key={i} md={4} sm={6} xs={12} className="d-flex justify-content-center">
          <Card className="recipe-card h-100" style={{ width: '100%' }}>
            <Card.Body>
              {/* Badge and Heart Skeleton */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={4} className="rounded-pill" style={{ height: '24px' }} />
                </Placeholder>
                <Placeholder as="div" animation="glow">
                  <Placeholder
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }}
                  />
                </Placeholder>
              </div>

              {/* Title Skeleton */}
              <div className="mb-2">
                <Placeholder as="h5" animation="glow">
                  <Placeholder xs={9} />
                </Placeholder>
              </div>

              {/* Description Skeleton */}
              <Placeholder as="p" animation="glow" className="mb-3">
                <Placeholder xs={12} size="sm" />
                <Placeholder xs={10} size="sm" />
                <Placeholder xs={8} size="sm" />
              </Placeholder>

              {/* Stats Section Skeleton */}
              <div className="d-flex flex-wrap justify-content-around text-center py-3 border-top border-bottom mb-3">
                {[1, 2, 3].map((stat) => (
                  <div key={stat} className="flex-fill">
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={8} className="fw-bold fs-5 mb-1" />
                      <Placeholder xs={10} size="sm" />
                    </Placeholder>
                  </div>
                ))}
              </div>

              {/* Button Skeleton */}
              <div className="d-flex justify-content-center">
                <Placeholder.Button variant="success" xs={9} style={{ height: '42px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

const Recipes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [userIngredientsId, setUserIngredientsId] = useState<Set<number>>(new Set());
  const [canMakeOnly, setCanMakeOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    difficulty: string[];
    totalTime: string[];
    servings: string[];
    rating: number | null;
  }>({
    difficulty: [],
    totalTime: [],
    servings: [],
    rating: null,
  });

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (sort: string, order: 'asc' | 'desc') => {
    setSortBy(sort);
    setSortOrder(order);
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by search term (case-insensitive)
    if (searchTerm.trim()) {
      filtered = filtered.filter(recipe => recipe.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

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
        const upperCaseDifficulties = filters.difficulty.map(d => d.toUpperCase());
        return upperCaseDifficulties.includes(recipe.difficulty);
      });
    }

    // Filter by total time
    if (filters.totalTime.length > 0) {
      filtered = filtered.filter(recipe => {
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

    // Filter by exact rating
    if (filters.rating !== null) {
      filtered = filtered.filter(recipe => recipe.rating === filters.rating);
    }

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;

          case 'difficulty':
            const difficultyOrder = { EASY: 1, MEDIUM: 2, HARD: 3 };
            comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            break;

          case 'time':
            const totalTimeA = a.prepTime + a.cookTime + (a.downTime || 0);
            const totalTimeB = b.prepTime + b.cookTime + (b.downTime || 0);
            comparison = totalTimeA - totalTimeB;
            break;

          case 'match-percent':
            const { matchPercent: matchPercentA } = checkIngredients(a.ingredients, userIngredientsId);
            const { matchPercent: matchPercentB } = checkIngredients(b.ingredients, userIngredientsId);
            comparison = matchPercentB - matchPercentA;
            break;

          case 'rating':
            comparison = b.rating - a.rating;
            break;

          case 'postdate':
            comparison = new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
            break;

          default:
            comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [recipes, userIngredientsId, canMakeOnly, filters, sortBy, sortOrder, searchTerm]);

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

  // Show skeleton while loading
  if (loading) {
    return <RecipesSkeleton />;
  }

  if (notFound) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><p>Recipe not found.</p></div>;
  }

  return (
      <Container className="mb-12 min-h-screen mt-5">
        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
          <RecipesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <RecipesFilterButton onApply={setFilters} />
          <RecipesSortButton onSort={handleSort}/>
        </div>
        <div className="d-flex justify-content-end flex-wrap gap-2 mb-2 align-items-center">
          <ToggleReceipesCanMake onToggleCanMake={setCanMakeOnly} />
          <AddRecipesModal />
        </div>

        <Row className="g-4 justify-content-center">
          {filteredAndSortedRecipes.map(recipe => (
            <Col key={recipe.id} md={4} sm={6} xs={12} className="d-flex justify-content-center">
              <RecipeCard recipe={recipe} userIngredientsId={userIngredientsId} />
            </Col>
          ))}
        </Row>
      </Container>
  );
};

export default Recipes;