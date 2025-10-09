/* eslint-disable max-len */
import React, { useEffect, useRef } from 'react';
import { Button, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

interface Instruction {
  id: number;
  step: number;
  content: string;
}

interface CookingInstructionsProps {
  instructions: Instruction[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
}

const CookingInstructions: React.FC<CookingInstructionsProps> = ({ instructions, currentStep, onNext, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastStepRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = lastStepRef.current;

      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;

      const scrollPosition = elementTop + elementHeight - containerHeight + 20;

      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth',
      })
    }
  }, [currentStep]);

  const sortedInstructions = instructions?.sort((a, b) => a.step - b.step) || [];
  const visibleSteps = sortedInstructions.slice(0, Math.min(currentStep + 1, sortedInstructions.length));
  const isLastStep = currentStep === sortedInstructions.length - 1;

  return (
    <Card className="mb-3 d-flex flex-column" 
          style={{ 
            minHeight: '40vh',
            maxHeight: '60vh'
          }}
    >
      <Card.Header className="bg-success-custom text-white py-3 d-flex flex-column align-items-start justify-content-center">
        <h4 className="mb-1">Instructions Guide</h4>
        <small>Follow the steps to prepare your dish</small>
      </Card.Header>

      <Card.Body className="d-flex flex-column flex-grow-1 overflow-hidden" 
        style={{ height: 'calc(60vh - 56px)' }}
      >
        <div
          className="flex-grow-1 p-3 overflow-y-auto"
          ref={containerRef}
          style={{ minHeight: 0, scrollBehavior: 'smooth' }}
        >
            <AnimatePresence>
              {visibleSteps.map((instruction, index) => (
                <motion.div
                  key={instruction.id}
                  ref={index === visibleSteps.length - 1 ? lastStepRef : null}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="flex items-start gap-4 p-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-custom text-white flex items-center justify-center font-bold">
                    {instruction.step}
                  </div>
                  <p className="flex-1">{instruction.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <Button
            className="w-20"
            variant="success"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            className="w-20"
            variant="success"
            onClick={onNext}
          >
            {isLastStep ? 'Done' : 'Next'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CookingInstructions;
