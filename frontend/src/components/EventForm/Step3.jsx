import { Star, Upload, X } from "lucide-react";

const Step3 = ({ formData, errors, imagePreview, handleInputChange, handleImageUpload, onRemoveImage }) => {
  return (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
          <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Final Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add description and images to complete your event
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Image
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="mx-auto h-40 w-full object-cover rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="avatar" className="cursor-pointer">
                  <span className="font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 50MB</p>
              </div>
            </div>
          )}
        </div>
        {errors.image && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.image}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your event, rules, prizes, and any other important details..."
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
};

export default Step3;
