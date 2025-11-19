/* eslint-disable no-case-declarations */
/* eslint-disable max-len */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Placeholder } from 'react-bootstrap';
import { Recipe } from '@prisma/client';
import RecipeCard from './RecipeCard';
import RecipesSearch from './RecipesSearch';
import RecipesFilterButton from './RecipesFilterButton';
import ToggleReceipesCanMake from './ToggleRecepiesCanMake';
import ToggleFavorites from './ToggleFavorites';
import RecipesSortButton from './RecipesSortButton';
import AddRecipeModal from './AddRecipesModal';
import RecommendedRecipes from './RecommendedRecipes';
import { checkIngredients } from '../../../utils/recipeUtils';

interface RecipeWithIngredients extends Recipe {
  ingredients: {
    ingredient: { id: number, name: string };
  }[];
}

// Loading Skeleton Component
const RecipesSkeleton: React.FC = () => (
  <Container className="mb-12 min-h-screen mt-5" style={{ width: '95%' }}>
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
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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
  const handleShowModal = () => {
    setShowAddRecipeModal(true); // Open the modal
  };

  const handleHideModal = () => {
    setShowAddRecipeModal(false); // Close the modal
  };
  const handleToggleFavorite = (recipeId: number, newIsStarredStatus: boolean) => {
    setRecipes(currentRecipes => currentRecipes.map(recipe => {
      if (recipe.id === recipeId) {
        return { ...recipe, isStarred: newIsStarredStatus };
      }
      return recipe;
    }));
  };

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
      try {
        const res = await fetch('/api/user-ingredients');
        if (res.ok) {
          const data = await res.json();
          setUserIngredientsId(new Set(data.ingredientIds));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecipes();
    fetchUserIngredients();
  }, []);

  const filteredAndSortedRecipes = useMemo<RecipeWithIngredients[]>(() => {
    let filtered: RecipeWithIngredients[] = recipes;

    // Filter by favorited
    if (showFavoritesOnly) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => recipe.isStarred);
    }

    // Filter by search term (case-insensitive)
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((recipe: RecipeWithIngredients) => {
        const nameMatch = recipe.name.toLowerCase().includes(lowerSearch);
        const ingredientMatch = recipe.ingredients?.some(
          (ing: { ingredient: { name: string } }) => ing.ingredient?.name?.toLowerCase().includes(lowerSearch),
        );
        const descriptionMatch = recipe.description?.toLowerCase().includes(lowerSearch);
        return nameMatch || ingredientMatch || descriptionMatch;
      });
    }

    if (canMakeOnly) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => {
        const { missingIngredients } = checkIngredients(recipe.ingredients, userIngredientsId);
        return missingIngredients.length === 0;
      });
    }

    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => {
        const upperCaseDifficulties = filters.difficulty.map((d: string) => d.toUpperCase());
        return upperCaseDifficulties.includes(recipe.difficulty);
      });
    }

    if (filters.totalTime.length > 0) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => {
        const totalTime = recipe.prepTime + recipe.cookTime + (recipe.downTime || 0);
        return filters.totalTime.some((timeRange: string) => {
          if (timeRange === '< 30 mins') return totalTime < 30;
          if (timeRange === '30 - 60 mins') return totalTime >= 30 && totalTime <= 60;
          if (timeRange === '> 60 mins') return totalTime > 60;
          return false;
        });
      });
    }

    if (filters.servings.length > 0) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => filters.servings.some((servingRange: string) => {
        if (servingRange === '1-2') return recipe.servings >= 1 && recipe.servings <= 2;
        if (servingRange === '3-4') return recipe.servings >= 3 && recipe.servings <= 4;
        if (servingRange === '5+') return recipe.servings >= 5;
        return false;
      }));
    }

    if (filters.rating !== null) {
      filtered = filtered.filter((recipe: RecipeWithIngredients) => recipe.rating === filters.rating);
    }

    if (sortBy) {
      filtered = [...filtered].sort((a: RecipeWithIngredients, b: RecipeWithIngredients) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'difficulty':
            const difficultyOrder: { [key: string]: number } = { EASY: 1, MEDIUM: 2, HARD: 3 };
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
  }, [recipes, userIngredientsId, canMakeOnly, filters, sortBy, sortOrder, searchTerm, showFavoritesOnly]);

  // Show skeleton while loading
  if (loading) {
    return <RecipesSkeleton />;
  }

  if (notFound) {
    return <div className="min-h-screen d-flex justify-content-center align-items-center"><p>Recipe not found.</p></div>;
  }

  return (
    <>
      <RecommendedRecipes />
      <Container className="mb-12 min-h-screen mt-5" style={{ width: '95%' }}>
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center flex-wrap gap-4">
                <RecipesSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <RecipesFilterButton onApply={setFilters} />
                <RecipesSortButton onSort={handleSort}/>
              </div>
              <div className="d-flex align-items-center flex-wrap gap-2">
                <ToggleFavorites onToggleFavorites={setShowFavoritesOnly} />
                <ToggleReceipesCanMake onToggleCanMake={setCanMakeOnly} />
                <button className="btn btn-success" onClick={handleShowModal}>
                  Add Recipe +
                </button>
                <AddRecipeModal
                  show={showAddRecipeModal}
                  onHide={handleHideModal}
                  onSubmit={(recipe) => {
                    console.log('Recipe submitted:', recipe); // Debugging
                    if (recipe) {
                      // Handle the recipe submission (e.g., update state or send to API)
                      console.log('Handling recipe submission...');
                    } else {
                      console.error('No recipe data received!');
                    }
                    handleHideModal(); // Close the modal
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
        {filteredAndSortedRecipes.length === 0 ? (
          <div className="min-h-screen d-flex justify-content-center align-items-center">
            <p>No recipes found matching your search. Please modify your filter.</p>
          </div>
        ) : (
          <Row className="g-4 justify-content-center">
            {filteredAndSortedRecipes.map(recipe => (
              <Col key={recipe.id} md={4} sm={6} xs={12} className="justify-content-center">
                <RecipeCard
                  recipe={recipe}
                  userIngredientsId={userIngredientsId}
                  searchTerm={searchTerm}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Col>
            ))}
          </Row>
        )}

      </Container>
    </>
  );
};

export default Recipes;
