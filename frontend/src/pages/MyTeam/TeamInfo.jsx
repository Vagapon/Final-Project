import React, { useEffect, useState } from "react";
import {
  Trophy,
  Phone,
  Mail,
  Users,
  Target,
  TrendingUp,
  Award,
  Shield,
  Edit2,
  Check,
  X,
  Trash2,
  Save,
  Camera,
  Upload,
} from "lucide-react";
import { message } from "antd";
import teamApi from "../../api/teamManagement/teamApi";

const StatCard = ({ value, label, colorClass, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-purple-300 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
          {value}
        </div>
      </div>
    </div>
    <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
      {label}
    </div>
  </div>
);

const TeamInfo = ({ team: initialTeam, playersCount: initialPlayersCount, onUpdate, onDelete }) => {
  const [team, setTeam] = useState(initialTeam);
  const [playersCount, setPlayersCount] = useState(initialPlayersCount || 0);
  const [loading, setLoading] = useState(!initialTeam);
  const [error, setError] = useState("");
  
  // Inline edit states
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (initialTeam) {
      setTeam(initialTeam);
      setLoading(false);
    } else {
      const fetchTeam = async () => {
        try {
          const response = await teamApi.getMyTeam();
          if (response.data) {
            setTeam(response.data);
            setPlayersCount(response.data?.players?.length || 0);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            setTeam(null);
          } else {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchTeam();
    }
  }, [initialTeam]);

  useEffect(() => {
    if (initialPlayersCount !== undefined) {
      setPlayersCount(initialPlayersCount);
    }
  }, [initialPlayersCount]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading team data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );

  const handleEditField = (field) => {
    setEditingField(field);
    setEditValues({
      [field]: team[field] || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleSaveField = async (field) => {
    if (!editValues[field] && field === 'name') {
      message.error('Team name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(field, editValues[field] || "");
      
      const response = await teamApi.updateTeam(team._id, formData);
      const updatedTeam = response.data;
      
      setTeam(updatedTeam);
      setEditingField(null);
      setEditValues({});
      
      // Hiển thị thông báo thành công
      const fieldNames = {
        name: 'Team name',
        shortName: 'Short name',
        description: 'Description'
      };
      message.success(`${fieldNames[field] || 'Information'} updated successfully!`);
      
      if (onUpdate) {
        onUpdate(updatedTeam);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      message.error(error.response?.data?.message || 'An error occurred while updating');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be less than 5MB');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await teamApi.updateTeam(team._id, formData);
      const updatedTeam = response.data;
      
      setTeam(updatedTeam);
      setAvatarPreview(null);
      
      message.success('Team logo updated successfully!');
      
      if (onUpdate) {
        onUpdate(updatedTeam);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      message.error(error.response?.data?.message || 'An error occurred while updating logo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    setSaving(true);
    try {
      await teamApi.deleteTeam(team._id);
      setShowDeleteConfirm(false);
      message.success('Team deleted successfully!');
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Unable to delete team. Please try again later.';
      message.error(errorMessage);
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!team)
    return (
      <div className="text-center py-16 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Team Found
            </h3>
            <p className="text-gray-600">You haven't created a team yet.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Premier League Style */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Team Logo */}
            <div className="relative group">
              {team.avatar ? (
                <img
                  src={team.avatar}
                  alt="Team Logo"
                  className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
                  <span className="text-purple-600 text-4xl font-bold">
                    {team.name?.charAt(0).toUpperCase() || "T"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <label className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105">
                {saving ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={saving}
                  className="hidden"
                />
              </label>
            </div>

            {/* Team Info */}
            <div className="text-center lg:text-left flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="text-4xl lg:text-5xl font-bold bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-lg px-3 py-1 flex-1 focus:outline-none focus:border-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('name')}
                      disabled={saving}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                      title="Save"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                      title="Cancel"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl lg:text-5xl font-bold">
                      {team.name || "Team Name"}
                    </h1>
                    <button
                      onClick={() => handleEditField('name')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Edit team name"
                    >
                      <Edit2 className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                {editingField === 'shortName' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.shortName || ""}
                      onChange={(e) => setEditValues({ ...editValues, shortName: e.target.value })}
                      maxLength={3}
                      className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white border-2 border-white/50 focus:outline-none focus:border-white w-20 text-center"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('shortName')}
                      disabled={saving}
                      className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                      title="Save"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                      title="Cancel"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                      {team.shortName || "N/A"}
                    </span>
                    <button
                      onClick={() => handleEditField('shortName')}
                      className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Edit short name"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <span className="text-purple-200 text-lg">
                  Founded • {new Date().getFullYear()}
                </span>
              </div>
              {editingField === 'description' ? (
                <div className="flex items-start gap-2 max-w-2xl">
                  <textarea
                    value={editValues.description || ""}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    rows={3}
                    className="text-purple-100 text-lg bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-white resize-none"
                    autoFocus
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSaveField('description')}
                      disabled={saving}
                      className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 max-w-2xl">
                  <p className="text-purple-100 text-lg leading-relaxed flex-1">
                    {team.description ||
                      "Professional football club competing at the highest level."}
                  </p>
                    <button
                      onClick={() => handleEditField('description')}
                      className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                      title="Edit description"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                </div>
              )}
            </div>

            {/* Manager Info & Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[280px]">
              <div className="mb-4">
                {team?.managerId && (
                  <div className="flex flex-col items-center">
                    <img
                      src={team.managerId.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-full mx-auto"
                    />
                  </div>
                )}
              </div>

              <p className="text-purple-100 font-medium mb-3">
                {team.managerId?.name || "N/A"}
              </p>
              <div className="space-y-2 text-sm mb-4">
                {team.managerId?.phone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{team.managerId.phone}</span>
                  </div>
                )}
                {team.managerId?.email && (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{team.managerId.email}</span>
                  </div>
                )}
              </div>
              
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
                className="w-full mt-4 px-4 py-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Trash2 className="w-4 h-4" />
                Delete Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            value={playersCount}
            label="Squad Size"
            colorClass="bg-emerald-500"
            icon={Users}
          />
          <StatCard
            value={0}
            label="Matches Played"
            colorClass="bg-blue-500"
            icon={Target}
          />
          <StatCard
            value={0}
            label="Wins"
            colorClass="bg-green-500"
            icon={TrendingUp}
          />
          <StatCard
            value={0}
            label="Losses"
            colorClass="bg-red-500"
            icon={Award}
          />
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {/* Club Information */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                Club Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Full Name
                  </label>
                  {editingField === 'name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValues.name || ""}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="text-gray-900 font-semibold text-lg border-2 border-purple-300 rounded-lg px-3 py-1 flex-1 focus:outline-none focus:border-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveField('name')}
                        disabled={saving}
                        className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Save"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Cancel"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <p className="text-gray-900 font-semibold text-lg flex-1">
                        {team.name || "Not specified"}
                      </p>
                      <button
                        onClick={() => handleEditField('name')}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                        title="Edit team name"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Short Name
                  </label>
                  {editingField === 'shortName' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValues.shortName || ""}
                        onChange={(e) => setEditValues({ ...editValues, shortName: e.target.value })}
                        maxLength={3}
                        className="text-gray-900 font-semibold text-lg border-2 border-purple-300 rounded-lg px-3 py-1 w-20 text-center focus:outline-none focus:border-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveField('shortName')}
                        disabled={saving}
                        className="p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Save"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Cancel"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <p className="text-gray-900 font-semibold text-lg flex-1">
                        {team.shortName || "N/A"}
                      </p>
                      <button
                        onClick={() => handleEditField('shortName')}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                        title="Edit short name"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  About
                </label>
                {editingField === 'description' ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={editValues.description || ""}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      rows={3}
                      className="text-gray-700 leading-relaxed border-2 border-purple-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-purple-500 resize-none"
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSaveField('description')}
                        disabled={saving}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Save"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95"
                        title="Cancel"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <p className="text-gray-700 leading-relaxed flex-1">
                      {team.description || "No description available."}
                    </p>
                    <button
                      onClick={() => handleEditField('description')}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Edit description"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Management */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Management
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {team.managerId?.avatar ? (
                    <img
                      src={team.managerId.avatar}
                      alt="Manager"
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center border border-gray-200">
                      <span className="text-purple-600 text-xl font-bold">
                        {team.managerId?.name?.charAt(0).toUpperCase() || "M"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {team.managerId?.name || "Manager Name"}
                  </h3>
                  <p className="text-purple-600 font-medium text-sm mb-4">
                    Team Manager
                  </p>
                  <div className="space-y-3">
                    {team.managerId?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {team.managerId.phone_number}
                        </span>
                      </div>
                    )}
                    {team.managerId?.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 font-medium break-all">
                          {team.managerId.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Team</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the team <span className="font-bold text-red-600">{team.name}</span>? 
                All related data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Team
                    </>
                  )}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamInfo;