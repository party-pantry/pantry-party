import { useState } from 'react';
import { DropdownButton, Dropdown, Form, Button } from 'react-bootstrap';
import { Filter, Star } from 'lucide-react';

interface RecipesFilterButtonProps {
  onApply?: (filters: {
    difficulty: string[];
    totalTime: string[];
    servings: string[];
    rating: number | null;
  }) => void;
}

const RecipesFilterButton: React.FC<RecipesFilterButtonProps> = ({ onApply }) => {
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState<string[]>([]);
  const [servings, setServings] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  const handleDifficultyChange = (option: string) => {
    setDifficulty((prev) => {
      if (prev.includes(option)) {
        return prev.filter((d) => d !== option);
      }
      return [...prev, option];
    });
  };

  const handleTotalTimeChange = (option: string) => {
    setTotalTime((prev) => {
      if (prev.includes(option)) {
        return prev.filter((t) => t !== option);
      }
      return [...prev, option];
    });
  };

  const handleServingsChange = (option: string) => {
    setServings((prev) => {
      if (prev.includes(option)) {
        return prev.filter((s) => s !== option);
      }
      return [...prev, option];
    });
  };

  const handleStarClick = (starCount: number) => {
    if (rating === starCount) {
      setRating(null);
    } else {
      setRating(starCount);
    }
  };

  const handleReset = () => {
    setDifficulty([]);
    setTotalTime([]);
    setServings([]);
    setRating(null);
    setHoveredRating(null);
    if (onApply) {
      onApply({ difficulty: [], totalTime: [], servings: [], rating: null });
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply({ difficulty, totalTime, servings, rating });
    }
  };

  return (
    <DropdownButton
      id="recipes-filter-dropdown"
      title={
        <div className="d-flex align-items-center gap-1">
          <Filter size={20} />
          <span>Filter</span>
        </div>
      }
      variant="outline-dark"
      align="end"
      drop="down"
      show={show}
      onToggle={(isOpen) => setShow(isOpen)}
    >
      <Form className="w-[250px]">
        <Form.Group className="m-3">
          <Form.Label className="fw-bold fs-6 text-bold">Difficulty</Form.Label>
          <Form.Check
            type="checkbox"
            label="Easy"
            checked={difficulty.includes('Easy')}
            onChange={() => handleDifficultyChange('Easy')}
          />
          <Form.Check
            type="checkbox"
            label="Medium"
            checked={difficulty.includes('Medium')}
            onChange={() => handleDifficultyChange('Medium')}
          />
          <Form.Check
            type="checkbox"
            label="Hard"
            checked={difficulty.includes('Hard')}
            onChange={() => handleDifficultyChange('Hard')}
          />

          <Dropdown.Divider />

          <Form.Label className="fw-bold fs-6 text-bold">Total Time</Form.Label>
          <Form.Check
            type="checkbox"
            label="< 30 mins"
            checked={totalTime.includes('< 30 mins')}
            onChange={() => handleTotalTimeChange('< 30 mins')}
          />
          <Form.Check
            type="checkbox"
            label="30 - 60 mins"
            checked={totalTime.includes('30 - 60 mins')}
            onChange={() => handleTotalTimeChange('30 - 60 mins')}
          />
          <Form.Check
            type="checkbox"
            label="> 60 mins"
            checked={totalTime.includes('> 60 mins')}
            onChange={() => handleTotalTimeChange('> 60 mins')}
          />

          <Dropdown.Divider />

          <Form.Label className="fw-bold fs-6 text-bold">Servings</Form.Label>
          <Form.Check
            type="checkbox"
            label="1-2"
            checked={servings.includes('1-2')}
            onChange={() => handleServingsChange('1-2')}
          />
          <Form.Check
            type="checkbox"
            label="3-4"
            checked={servings.includes('3-4')}
            onChange={() => handleServingsChange('3-4')}
          />
          <Form.Check
            type="checkbox"
            label="5+"
            checked={servings.includes('5+')}
            onChange={() => handleServingsChange('5+')}
          />

          <Dropdown.Divider />

          <Form.Label className="fw-bold fs-6 text-bold">Rating</Form.Label>
            <div
            className="d-flex align-items-center gap-2 mb-2"
            onMouseLeave={() => setHoveredRating(null)}
            >
            {[1, 2, 3, 4, 5].map((star) => {
              const displayRating = hoveredRating !== null ? hoveredRating : rating;
              const isFilled = star <= (displayRating || 0);

              return (
                <div
                    key={star}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: isFilled ? '#3c5c50' : '#e9ecef',
                      borderRadius: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isFilled ? '1px solid #3c5c50' : '1px solid #d9d9d9',
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onClick={() => handleStarClick(star)}
                >
                    <Star
                    size={18}
                    fill="white"
                    stroke="white"
                    />
                </div>
              );
            })}
            </div>
            {rating !== null && (
            <Form.Text className="text-muted d-block mb-2">
                Selected: {rating} Star{rating !== 1 ? 's' : ''}
            </Form.Text>
            )}

          <div className="mt-3 d-flex justify-content-between align-items-center">
            <Button
              variant="danger"
              style={{ width: '100px' }}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              style={{ width: '100px' }}
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </Form.Group>
      </Form>
    </DropdownButton>
  );
};

export default RecipesFilterButton;
