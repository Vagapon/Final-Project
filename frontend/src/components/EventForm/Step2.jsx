import { Calendar, MapPin, X } from "lucide-react";

const Step2 = ({ formData, errors, seasons, handleInputChange }) => {
  const statusOptions = [
    { value: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-800" },
    { value: "ongoing", label: "Ongoing", color: "bg-green-100 text-green-800" },
    { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-800" },
  ];

  return (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3">
          <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Date & Location</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set the schedule and venue for your event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            min={(() => {
              const selectedSeason = seasons.find(s => s._id === formData.seasonId);
              const today = new Date().toISOString().split('T')[0];
              if (selectedSeason) {
                const seasonStart = new Date(selectedSeason.startDate).toISOString().split('T')[0];
                return seasonStart > today ? seasonStart : today;
              }
              return today;
            })()}
            max={(() => {
              const selectedSeason = seasons.find(s => s._id === formData.seasonId);
              return selectedSeason ? new Date(selectedSeason.endDate).toISOString().split('T')[0] : '';
            })()}
            className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.startDate
                ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          />
          {errors.startDate && (
            <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="w-3 h-3" />
              {errors.startDate}
            </small>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            min={formData.startDate || (() => {
              const selectedSeason = seasons.find(s => s._id === formData.seasonId);
              const today = new Date().toISOString().split('T')[0];
              if (selectedSeason) {
                const seasonStart = new Date(selectedSeason.startDate).toISOString().split('T')[0];
                return seasonStart > today ? seasonStart : today;
              }
              return today;
            })()}
            max={(() => {
              const selectedSeason = seasons.find(s => s._id === formData.seasonId);
              return selectedSeason ? new Date(selectedSeason.endDate).toISOString().split('T')[0] : '';
            })()}
            className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.endDate
                ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          />
          {errors.endDate && (
            <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="w-3 h-3" />
              {errors.endDate}
            </small>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location/Venue Name *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., National Stadium, Sports Center..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.location
                ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          />
        </div>
        {errors.location && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.location}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Full Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter complete address for GPS navigation..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Teams *
          </label>
          <input
            type="number"
            name="maxTeams"
            value={formData.maxTeams}
            onChange={handleInputChange}
            min="1"
            placeholder="Enter number of teams"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <small className="text-gray-500 dark:text-gray-400 mt-1 block">
            Number of matches will be calculated automatically: {formData.maxTeams ? Math.floor((parseInt(formData.maxTeams) * (parseInt(formData.maxTeams) - 1)) / 2) : 0} matches
          </small>
          {errors.maxTeams && (
            <small className="text-red-500 mt-1 block">
              {errors.maxTeams}
            </small>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() =>
                  handleInputChange({
                    target: { name: "status", value: status.value },
                  })
                }
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.status === status.value
                    ? status.color + " shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
