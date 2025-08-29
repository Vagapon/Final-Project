import React, { useState, useEffect } from 'react';
import { X, Upload, Users, Trophy, Edit3, Camera, User, Phone, Mail, Plus, Crown } from 'lucide-react';

const ModalTeam = ({ isOpen, onClose, onSubmit }) => {
  const [user] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    avatar: null
  });
  
  const [formData, setFormData] = useState({
    teamName: '',
    shortName: '',
    description: '',
    playerCount: '11',
    formation: '4-4-2',
    logo: null
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [members, setMembers] = useState([
    { id: 1, name: '', avatar: null },
    { id: 2, name: '', avatar: null }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      handleFileUpload(file, setLogoPreview);
    }
  };

  const updateMember = (id, field, value) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMember = () => {
    const newId = Math.max(...members.map(m => m.id)) + 1;
    setMembers(prev => [...prev, { id: newId, name: '', avatar: null }]);
  };

  const removeMember = (id) => {
    if (members.length > 1) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!formData.teamName) {
      alert('Vui lòng điền tên đội bóng');
      return;
    }
    
    const submissionData = {
      ...formData,
      captain: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      members
    };
    
    onSubmit && onSubmit(submissionData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* Header - Clean & Simple */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Create new team</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in the information to create a team for the tournament</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            
            {/* LEFT SIDE - Team Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Team details</h3>

                {/* Logo Upload - Minimalist */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Team Logo" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera size={20} className="text-gray-400" />
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                      <Upload size={12} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Upload team logo</p>
                </div>

                {/* Form Fields - Clean Style */}
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team name *
                      </label>
                      <input
                        type="text"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Enter team name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short name
                      </label>
                      <input
                        type="text"
                        name="shortName"
                        value={formData.shortName}
                        onChange={handleInputChange}
                        maxLength="3"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="e.g. MAN"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      placeholder="Describe your team..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Members List */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Team members
                    <span className="ml-2 text-sm font-normal text-gray-500">({members.length})</span>
                  </h3>
                  
                  <button
                    type="button"
                    onClick={addMember}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium text-sm"
                  >
                    <Plus size={14} className="mr-1" />
                    Add member
                  </button>
                </div>

                {/* Members List - Clean Cards */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {members.map((member, index) => (
                    <div key={member.id} className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition border">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={`Member ${index + 1}`} 
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User size={14} className="text-gray-500" />
                            </div>
                          )}
                          
                          <label className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                            <Camera size={6} className="text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e.target.files[0], (result) => updateMember(member.id, 'avatar', result))}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">Member #{index + 1}</div>
                          <input
                            type="text"
                            placeholder="Enter member name..."
                            value={member.name}
                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition text-sm"
                          />
                        </div>

                        {/* Remove Button */}
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center transition"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Captain Info - Clean Card */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Team captain</h4>
                  
                  {user ? (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt="Captain Avatar" 
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User size={20} className="text-blue-600" />
                            </div>
                          )}
                          {/* Captain Badge */}
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Crown size={10} className="text-white" />
                          </div>
                        </div>

                        {/* Captain Details */}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{user.name}</h5>
                          
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail size={12} className="mr-2 text-gray-400" />
                              <span>{user.email}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone size={12} className="mr-2 text-gray-400" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                      <User size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm">No user information found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Clean Style */}
          <div className="border-t bg-gray-50 px-8 py-4">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
              >
                Create team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTeam;