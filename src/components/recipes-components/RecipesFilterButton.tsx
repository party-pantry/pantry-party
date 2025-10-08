import { useState } from 'react';
import { DropdownButton, Dropdown, Form, Button } from 'react-bootstrap';
import { Filter } from 'lucide-react';

interface RecipesFilterButtonProps {
  onApply?: (filters: {
    difficulty: string[];
    totalTime: string[];
    servings: string[];
    rating: string[];
  }) => void;
}

const RecipesFilterButton: React.FC<RecipesFilterButtonProps> = ({ onApply }) => {
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState<string[]>([]);
  const [servings, setServings] = useState<string[]>([]);
  const [rating, setRating] = useState<string[]>([]);

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

  const handleRatingChange = (option: string) => {
    setRating((prev) => {
      if (prev.includes(option)) {
        return prev.filter((r) => r !== option);
      }
      return [...prev, option];
    });
  };

  const handleReset = () => {
    setDifficulty([]);
    setTotalTime([]);
    setServings([]);
    setRating([]);
    if (onApply) {
      onApply({ difficulty: [], totalTime: [], servings: [], rating: [] });
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
          <Form.Check
            type="checkbox"
            label="1 Star & Up"
            checked={rating.includes('1 Star & Up')}
            onChange={() => handleRatingChange('1 Star & Up')}
          />
          <Form.Check
            type="checkbox"
            label="2 Stars & Up"
            checked={rating.includes('2 Stars & Up')}
            onChange={() => handleRatingChange('2 Stars & Up')}
          />
          <Form.Check
            type="checkbox"
            label="3 Stars & Up"
            checked={rating.includes('3 Stars & Up')}
            onChange={() => handleRatingChange('3 Stars & Up')}
          />
          <Form.Check
            type="checkbox"
            label="4 Stars & Up"
            checked={rating.includes('4 Stars & Up')}
            onChange={() => handleRatingChange('4 Stars & Up')}
          />
          <Form.Check
            type="checkbox"
            label="5 Stars"
            checked={rating.includes('5 Stars')}
            onChange={() => handleRatingChange('5 Stars')}
          />

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
