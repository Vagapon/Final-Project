import { Trophy, X } from "lucide-react";

const Step1 = ({ formData, errors, sportTypes, seasons, handleInputChange }) => {
  return (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
          <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter the basic details for your event
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter event name..."
          className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name
              ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }`}
        />
        {errors.name && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.name}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sport Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sportTypes.map((sport) => {
            const IconComponent = sport.icon || Trophy;
            return (
              <div
                key={sport._id}
                onClick={() =>
                  handleInputChange({
                    target: { name: "sportTypeId", value: sport._id },
                  })
                }
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.sportTypeId === sport._id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-6 h-6 mx-auto mb-2 ${sport.color || ''}`} />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sport.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {errors.sportTypeId && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.sportTypeId}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Season *
        </label>
        <select
          name="seasonId"
          value={formData.seasonId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.seasonId
              ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }`}
        >
          <option value="">Select season...</option>
          {seasons
            .filter((season) => {
              // Chỉ hiển thị season chưa kết thúc (endDate >= current date)
              const seasonEndDate = new Date(season.endDate);
              const currentDate = new Date();
              // Reset time để so sánh chỉ ngày
              seasonEndDate.setHours(0, 0, 0, 0);
              currentDate.setHours(0, 0, 0, 0);
              return seasonEndDate >= currentDate;
            })
            .map((season) => (
              <option key={season._id} value={season._id}>
                {season.name} ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
              </option>
            ))}
        </select>
        {formData.seasonId && (
          <small className="text-gray-500 dark:text-gray-400 text-sm mt-1 block">
            Season period: {(() => {
              const selectedSeason = seasons.find(s => s._id === formData.seasonId);
              return selectedSeason ? 
                `${new Date(selectedSeason.startDate).toLocaleDateString()} to ${new Date(selectedSeason.endDate).toLocaleDateString()}` : 
                '';
            })()}
          </small>
        )}
        {errors.seasonId && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.seasonId}
          </small>
        )}
      </div>
    </div>
  );
};

export default Step1;
