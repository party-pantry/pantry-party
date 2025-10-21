import { useState } from 'react';
import { Form } from 'react-bootstrap';

interface ToggleFavoritesProps {
  onToggleFavorites?: (enabled: boolean) => void;
}

const ToggleFavorites: React.FC<ToggleFavoritesProps> = ({ onToggleFavorites }) => {
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // On toggle for showing favorited recipes only
  const handleToggle = () => {
    const newValue = !favoritesOnly;
    setFavoritesOnly(newValue);
    onToggleFavorites?.(newValue);
  };

  return (
    <Form className="d-flex align-items-center pb-1 mb-2 pb- pe-4">
        {/* Favorited recipes toggle */}
        <Form.Check
            type="switch"
            label="Show Hearted Recipes"
            className="mt-3"
            checked={favoritesOnly}
            onChange={handleToggle}
        />
    </Form>
  );
};

export default ToggleFavorites;
