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
      ingredient: { id: number, name: string };
    }[];
  };
  userIngredientsId?: Set<number>;
  searchTerm?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, userIngredientsId, searchTerm }) => {
  const router = useRouter();
  const link = slugify(recipe.name, { lower: true, strict: true });

  const handleViewDetails = () => {
    router.push(`/recipe/${recipe.id}/${link}`);
  };

  const [isFavorited, setIsFavorited] = useState(false);

  // TODO: implement pinned recipes functionality
  const toggleFavorite = () => setIsFavorited(!isFavorited);

  const difficulty = getDifficulty(recipe.difficulty);

  const totalTime = calculateTotalTime(recipe.prepTime, recipe.cookTime, recipe.downTime || 0);

  const { matchPercent } = checkIngredients(recipe.ingredients, userIngredientsId);

  const rating = Math.min(Math.max(recipe.rating ?? 0, 0), 5);


  // Highlight searched words in recipe name and description
  const highlightText = (text: string, term: string = '') => {
    // Nothing to highlight in search (not found/empty search)
    if (!term.trim()) return text;

    // Create a regex expression to find the term, case insensitive
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };


  return (
    <Card className="recipe-card h-100">
      <CardBody>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <Badge bg={difficulty.variant}>{difficulty.label}</Badge>
          <Heart
            size={20}
            stroke={isFavorited ? 'black' : 'currentColor'}
            fill={isFavorited ? 'red' : 'none'}
            style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}
            onClick={toggleFavorite}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        <div className="d-flex align-items-center mb-2">
          <CardTitle className="fs-4 mb-0">
            {highlightText(recipe.name, searchTerm)}
          </CardTitle>
        </div>

        <CardText className="recipe-card-description text-muted">
          {highlightText(recipe.description || '', searchTerm)}
        </CardText>

       {/* <CardText className="text-muted small">
        Ingredients:{' '}
        {recipe.ingredients.map((ing, i) => (
          <span key={ing.ingredient.id}>
            {highlightText(ing.ingredient.name, searchTerm)}
            {i < recipe.ingredients.length - 1 ? ', ' : ''}
          </span>
        ))}
      </CardText> */}

        <div className="d-flex flex-wrap justify-content-around text-center py-3 border-top border-bottom mb-3">
          {[
            { label: 'Total Time', value: `${totalTime} mins` },
            { label: 'Ingredients Match', value: `${matchPercent.toFixed(0)}%` },
            { label: 'Rating', value: `${rating.toFixed(1)}` },
          ].map((item) => (
            <div key={item.label} className="flex-fill">
              <div className="fw-bold fs-5">{item.value}</div>
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
