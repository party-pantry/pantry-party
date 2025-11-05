import { useState } from 'react';
import { Form } from 'react-bootstrap';

interface ToggleReceipesCanMakeProps {
  onToggleCanMake?: (enabled: boolean) => void;
}

const ToggleReceipesCanMake: React.FC<ToggleReceipesCanMakeProps> = ({ onToggleCanMake }) => {
  const [canMakeOnly, setCanMakeOnly] = useState(false);

  // On toggle for checking recipes with all ingredients available
  const handleToggle = () => {
    const newValue = !canMakeOnly;
    setCanMakeOnly(newValue);
    onToggleCanMake?.(newValue);
  };

  return (
    <Form className="d-flex align-items-center pb-1 mb-2 pb- pe-4">
        {/* Recipes I can make toggle */}
        <Form.Check
            type="switch"
            label="Recipes I Can Make"
            className="custom-switch mt-3"
            checked={canMakeOnly}
            onChange={handleToggle}
        />
    </Form>
  );
};

export default ToggleReceipesCanMake;
