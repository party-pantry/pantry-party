/* eslint-disable max-len */

'use client';

import slugify from 'slugify';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Recipe } from '@prisma/client';
import { Heart } from 'lucide-react';
import { Card, CardBody, CardTitle, CardText, Badge, Button } from 'react-bootstrap';
import {
  calculateTotalTime,
  getDifficulty,
  checkIngredients,
} from '@/utils/recipeUtils';

interface RecipeCardProps {
  recipe: Recipe & {
    ingredients: {
      ingredient: { id: number; name: string };
    }[];
  };
  userIngredientsId?: Set<number>;
  searchTerm?: string;
  onToggleFavorite: (recipeId: number, newIsStarredStatus: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  userIngredientsId,
  searchTerm,
  onToggleFavorite,
}) => {
  const router = useRouter();
  const link = slugify(recipe.name, { lower: true, strict: true });

  const handleViewDetails = () => {
    router.push(`/recipe/${recipe.id}/${link}`);
  };

  const [isStarred, setIsStarred] = useState(recipe.isStarred);
  const [isToggling, setIsToggling] = useState(false);

  const toggleFavorite = async () => {
    if (isToggling) return;

    setIsToggling(true);
    const newIsStarred = !isStarred;

    setIsStarred(newIsStarred);
    onToggleFavorite(recipe.id, newIsStarred);

    try {
      const response = await fetch(`/api/recipes/${recipe.id}/star`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isStarred: newIsStarred }),
      });

      if (!response.ok) {
        setIsStarred(!newIsStarred);
        console.error('Failed to update favorite status on server.');
      } else if (!newIsStarred) {
        onToggleFavorite(recipe.id, newIsStarred);
      }
    } catch (error) {
      setIsStarred(!newIsStarred);
      console.error('Error toggling favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const getMatchPercentColor = (percent: number) => {
    if (percent === 100) return '#19872bff';
    if (percent >= 80) return '#c97601ff';
    return '#d21f1fff';
  };

  const difficulty = getDifficulty(recipe.difficulty);

  const totalTime = calculateTotalTime(
    recipe.prepTime,
    recipe.cookTime,
    recipe.downTime || 0,
  );

  const { matchPercent } = checkIngredients(
    recipe.ingredients,
    userIngredientsId,
  );

  // Safely clamp rating to [0, 5] and default to 0 if missing/NaN
  const rawRating =
    typeof recipe.rating === 'number' && !Number.isNaN(recipe.rating)
      ? recipe.rating
      : 0;
  const rating = Math.min(Math.max(rawRating, 0), 5);

  // Highlight searched words in recipe name and description
  const highlightText = (text: string, term: string = '') => {
    if (!term.trim()) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      (part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )),
    );
  };

  return (
    <Card className="recipe-card h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Badge bg={difficulty.variant}>{difficulty.label}</Badge>
          <Heart
            size={20}
            stroke={isStarred ? 'black' : 'currentColor'}
            fill={isStarred ? 'red' : 'none'}
            style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}
            onClick={toggleFavorite}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = 'scale(1.1)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = 'scale(1)')
            }
          />
        </div>

        <div className="d-flex mb-2 align-items-center recipe-card-title pt-2">
          <CardTitle className="fs-4 mb-0">
            {highlightText(recipe.name, searchTerm)}
          </CardTitle>
        </div>

        <CardText className="recipe-card-description text-muted mb-4 recipe-card-description">
          {highlightText(recipe.description || '', searchTerm)}
        </CardText>

        <div className="d-flex flex-wrap justify-content-around text-center py-3 border-top border-bottom mb-3">
          {[
            { label: 'Time', value: `${totalTime} mins` },
            {
              label: 'Ingredients Match',
              value: `${matchPercent.toFixed(0)}%`,
              color: getMatchPercentColor(matchPercent),
            },
            {
              // 👇 dynamic label that shows how many reviews exist
              label:
                recipe.reviewCount && recipe.reviewCount > 0
                  ? `Rating (${recipe.reviewCount})`
                  : 'Rating',
              value: `${rating.toFixed(1)}`,
            },
          ].map((item) => (
            <div key={item.label} className="flex-fill">
              <div
                className="fw-bold fs-5"
                style={{ color: item.color || 'inherit' }}
              >
                {item.value}
              </div>
              <div className="text-muted small">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center">
          <Button
            variant="success"
            className="w-75 py-2 fw-semibold"
            onClick={handleViewDetails}
          >
            View More Details
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecipeCard;
