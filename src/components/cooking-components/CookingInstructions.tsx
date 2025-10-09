/* eslint-disable max-len */
import React from 'react';
import { Button, Card, Badge } from 'react-bootstrap';

interface Instruction {
  id: number;
  step: number;
  content: string;
}

interface CookingInstructionsProps {
  instructions: Instruction[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
}

const CookingInstructions: React.FC<CookingInstructionsProps> = ({
  instructions,
  currentStep,
  onNext,
  onPrevious,
}) => {
  const sortedInstructions = instructions?.sort((a, b) => a.step - b.step) || [];
  const currentInstruction = sortedInstructions[currentStep];
  const isLastStep = currentStep === sortedInstructions.length - 1;

  return (
    <Card className="h-100">
      <Card.Header className="bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Step {currentInstruction?.step || currentStep + 1}</h4>
          <Badge bg="light" text="dark">
            {currentStep + 1} / {sortedInstructions.length}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <div className="flex-grow-1 d-flex align-items-start justify-content-start">
          <div className="w-100 p-4">
            <div className="d-flex align-items-start gap-4 mb-4">
              <div
                className="flex-shrink-0 rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
              >
                {currentInstruction?.step || currentStep + 1}
              </div>
              <div className="flex-grow-1">
                <p className="mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                  {currentInstruction?.content || 'No instruction available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${((currentStep + 1) / sortedInstructions.length) * 100}%`,
              }}
            />
          </div>
          <small className="text-muted mt-1 d-block">
            Progress: {currentStep + 1} of {sortedInstructions.length} steps
          </small>
        </div>

        <div className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={onPrevious}
            size="lg"
          >
            ← {currentStep === 0 ? 'Ingredients' : 'Previous'}
          </Button>

          {!isLastStep ? (
            <Button variant="primary" onClick={onNext} size="lg">
              Next →
            </Button>
          ) : (
            <Button variant="success" disabled size="lg">
              Complete!
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CookingInstructions;
