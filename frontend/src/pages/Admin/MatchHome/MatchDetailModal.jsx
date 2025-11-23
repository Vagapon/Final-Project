import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Trophy, Award, Flag, Save } from 'lucide-react';
import { matchScheduleApi } from '../../../api';
import { message } from 'antd';

const MatchDetailModal = ({ isOpen, onClose, match, onUpdate }) => {
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (match && match.score) {
      setScore({
        team1: match.score.team1 || 0,
        team2: match.score.team2 || 0
      });
    } else {
      setScore({ team1: 0, team2: 0 });
    }
    setIsEditing(false);
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const team1Name = match.team1Id?.name || match.team1Id?.shortName || 'N/A';
  const team2Name = match.team2Id?.name || match.team2Id?.shortName || 'N/A';
  const team1Avatar = match.team1Id?.avatar || match.team1Id?.logo;
  const team2Avatar = match.team2Id?.avatar || match.team2Id?.logo;
  const fieldName = match.fieldId?.name || 'No field selected';
  const fieldAddress = match.fieldId?.address || '';

  const statusConfig = {
    upcoming: { 
      label: 'Upcoming', 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
      borderColor: 'border-blue-200'
    },
    ongoing: { 
      label: 'Ongoing', 
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-200'
    },
    completed: { 
      label: 'Completed', 
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      dotColor: 'bg-green-500',
      borderColor: 'border-green-200'
    },
    cancelled: { 
      label: 'Cancelled', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      dotColor: 'bg-gray-500',
      borderColor: 'border-gray-200'
    }
  };

  const currentStatus = match.status || 'upcoming';
  const statusInfo = statusConfig[currentStatus] || statusConfig.upcoming;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Match Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match Teams */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-center gap-6">
              {/* Team 1 */}
              <div className="flex flex-col items-center gap-3 flex-1">
                {team1Avatar ? (
                  <img 
                    src={team1Avatar} 
                    alt={team1Name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg bg-blue-500 ${team1Avatar ? 'hidden' : ''}`}
                >
                  {(team1Name || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{team1Name}</h3>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={score.team1}
                    onChange={(e) => setScore({ ...score, team1: parseInt(e.target.value) || 0 })}
                    className="w-20 text-center text-3xl font-bold text-blue-600 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-3xl font-bold text-blue-600">
                    {match.score?.team1 || score.team1 || 0}
                  </div>
                )}
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl font-bold text-gray-400">VS</div>
                {(match.score || isEditing) && (
                  <div className="text-sm text-gray-500">Result</div>
                )}
              </div>

              {/* Team 2 */}
              <div className="flex flex-col items-center gap-3 flex-1">
                {team2Avatar ? (
                  <img 
                    src={team2Avatar} 
                    alt={team2Name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg bg-green-500 ${team2Avatar ? 'hidden' : ''}`}
                >
                  {(team2Name || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{team2Name}</h3>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={score.team2}
                    onChange={(e) => setScore({ ...score, team2: parseInt(e.target.value) || 0 })}
                    className="w-20 text-center text-3xl font-bold text-green-600 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="text-3xl font-bold text-green-600">
                    {match.score?.team2 || score.team2 || 0}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Match Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Match Date</label>
                    <p className="text-gray-900 font-medium">{formatDate(match.matchDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Match Time</label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {match.matchTime || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900 font-medium">{match.duration || 90} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Round</label>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      {match.round || 'N/A'}
                    </p>
                  </div>
                  {match.matchNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Match Number</label>
                      <p className="text-gray-900 font-medium">#{match.matchNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}`}>
                  <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></div>
                  <span>{statusInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Field Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Field</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Field Name</label>
                    <p className="text-gray-900 font-medium">{fieldName}</p>
                  </div>
                  {fieldAddress && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900 font-medium">{fieldAddress}</p>
                    </div>
                  )}
                  {match.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Detailed Address</label>
                      <p className="text-gray-900 font-medium">{match.address}</p>
                    </div>
                  )}
                  {match.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900 font-medium">{match.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Information */}
              {match.eventId && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Event</h3>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Event Name</label>
                    <p className="text-gray-900 font-medium">{match.eventId?.name || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(match.createdAt || match.updatedAt) && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {match.createdAt && (
                  <div>
                    <label className="text-gray-500">Created At</label>
                    <p className="text-gray-700 font-medium">
                      {new Date(match.createdAt).toLocaleString('en-US')}
                    </p>
                  </div>
                )}
                {match.updatedAt && (
                  <div>
                    <label className="text-gray-500">Last Updated</label>
                    <p className="text-gray-700 font-medium">
                      {new Date(match.updatedAt).toLocaleString('en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 p-6 flex justify-end gap-3 rounded-b-2xl">
          {match.status === 'completed' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Edit Score
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (match.score) {
                    setScore({
                      team1: match.score.team1 || 0,
                      team2: match.score.team2 || 0
                    });
                  }
                }}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await matchScheduleApi.updateMatchResult(match._id, {
                      score: { team1: score.team1, team2: score.team2 },
                      status: 'completed'
                    });
                    message.success('Score updated successfully! Ranking has been automatically updated.');
                    setIsEditing(false);
                    if (onUpdate) {
                      onUpdate();
                    }
                    onClose();
                  } catch (error) {
                    message.error('Unable to update score');
                    console.error('Error updating score:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Score'}
              </button>
            </>
          )}
          {!isEditing && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;

