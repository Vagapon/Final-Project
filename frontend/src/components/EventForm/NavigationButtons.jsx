import { Clock, Save } from "lucide-react";

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  onPrevStep, 
  onNextStep, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          currentStep === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        Previous
      </button>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNextStep}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            Next Step
            <Clock className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Create Event
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;
