import React, { useState, useEffect } from 'react';
import { X, Save, Trophy, AlertCircle } from 'lucide-react';
import { matchScheduleApi } from '../../../api';
import { message } from 'antd';

const UpdateScoreModal = ({ isOpen, onClose, match, onUpdate }) => {
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && match) {
      if (match.score) {
        setScore({
          team1: match.score.team1 || 0,
          team2: match.score.team2 || 0
        });
      } else {
        setScore({ team1: 0, team2: 0 });
      }
      setErrors({});
    }
  }, [isOpen, match]);

  const handleScoreChange = (team, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;
    
    setScore(prev => ({
      ...prev,
      [team]: numValue
    }));
    
    // Clear error when user starts typing
    if (errors[team]) {
      setErrors(prev => ({
        ...prev,
        [team]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (score.team1 < 0 || score.team2 < 0) {
      newErrors.general = 'Score cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await matchScheduleApi.updateMatchResult(match._id, {
        score: { team1: score.team1, team2: score.team2 },
        status: 'completed'
      });
      
      message.success('Score updated successfully! Ranking has been automatically updated.');
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to update score';
      message.error(errorMessage);
      console.error('Error updating score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !match) return null;

  const team1Name = match.team1Id?.name || match.team1Id?.shortName || 'Team 1';
  const team2Name = match.team2Id?.name || match.team2Id?.shortName || 'Team 2';
  const team1Avatar = match.team1Id?.avatar || match.team1Id?.logo;
  const team2Avatar = match.team2Id?.avatar || match.team2Id?.logo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Update Match Score
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Match Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Match:</span> {team1Name} vs {team2Name}
            </div>
            {match.round && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Round:</span> {match.round}
              </div>
            )}
          </div>

          {/* Score Input */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200 mb-6">
            <div className="flex items-center justify-center gap-8">
              {/* Team 1 */}
              <div className="flex flex-col items-center gap-4 flex-1">
                {team1Avatar ? (
                  <img 
                    src={team1Avatar} 
                    alt={team1Name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg bg-blue-500 ${team1Avatar ? 'hidden' : ''}`}
                >
                  {(team1Name || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{team1Name}</h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={score.team1}
                    onChange={(e) => handleScoreChange('team1', e.target.value)}
                    className={`w-24 text-center text-4xl font-bold text-blue-600 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.team1 ? 'border-red-500' : 'border-blue-300'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl font-bold text-gray-400">VS</div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center gap-4 flex-1">
                {team2Avatar ? (
                  <img 
                    src={team2Avatar} 
                    alt={team2Name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg bg-green-500 ${team2Avatar ? 'hidden' : ''}`}
                >
                  {(team2Name || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{team2Name}</h3>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={score.team2}
                    onChange={(e) => handleScoreChange('team2', e.target.value)}
                    className={`w-24 text-center text-4xl font-bold text-green-600 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      errors.team2 ? 'border-red-500' : 'border-green-300'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Note:</p>
              <p>Updating the score will automatically update the ranking table for this event.</p>
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {errors.general}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Updating...' : 'Update Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateScoreModal;

