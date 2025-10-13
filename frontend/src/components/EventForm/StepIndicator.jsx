const StepIndicator = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div className="flex items-center justify-center space-x-2 pt-4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
              step === currentStep
                ? "bg-blue-600 text-white"
                : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            }`}
          >
            {step < currentStep ? "✓" : step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-8 h-0.5 mx-1 transition-all duration-200 ${
                step < currentStep ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
