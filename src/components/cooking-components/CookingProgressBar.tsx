import React from 'react';

interface CookingProgressBarProps {
  currentStep: number;
  totalInstructions: number;
}

const CookingProgressBar: React.FC<CookingProgressBarProps> = ({ currentStep, totalInstructions }) => {
    const totalSteps = totalInstructions;
    const currentProgressStep = currentStep + 1;

    const progressPercentage = totalSteps > 0 ?
        (currentProgressStep / totalSteps) * 100 : 0;
    
    return (
        <div className="mb-4">
            <div className="progress" style={{ height: '12px' }}>
                <div 
                    className="progress-bar bg-success"
                    style={{ 
                        width: `${progressPercentage}%`,
                        transition: 'width 0.3s ease'
                    }}
                />
            </div>
            <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                    Progress: {currentProgressStep} of {totalSteps} steps
                </small>
            </div>
        </div>
    );
};

export default CookingProgressBar;
