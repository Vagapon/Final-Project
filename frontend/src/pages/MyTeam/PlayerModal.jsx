import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import memberApi from '../../api/memberManagement/memberApi';

const PlayerModal = ({ isOpen, onClose, onSubmit, teamId, mode = 'create', initialData = null }) => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'sheet'
  const [formData, setFormData] = useState({
    nameMember: '',
    number: '',
    isCaptain: false,
    avatar: '',
    avatarFile: null
  });
  const [sheetUrl, setSheetUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, avatarFile: file }));
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'manual') {
      onSubmit(formData);
    } else {
      try {
        const response = await memberApi.importMembersFromSheet(teamId, sheetUrl);
        if (response.data.success) {
          onClose();
          // Success notification and refresh list
          alert(`Import successful: ${response.data.count} members`);
        }
      } catch (error) {
        console.error('Error importing from sheet:', error);
        const msg = error.response?.data?.message || error.response?.data?.error || error.message;
        alert(`Import failed: ${msg}`);
      }
    }
  };

  // Reset or prefill form when modal opens
  React.useEffect(() => {
    if (!isOpen) return;
    setActiveTab('manual');
    if (mode === 'edit' && initialData) {
      setFormData({
        nameMember: initialData.nameMember || initialData.name || '',
        number: initialData.number || '',
        isCaptain: Boolean(initialData.isCaptain),
        avatar: initialData.avatar || '',
        avatarFile: null
      });
      setPreviewImage(initialData.avatar || null);
    } else {
      setFormData({ nameMember: '', number: '', isCaptain: false, avatar: '', avatarFile: null });
      setPreviewImage(null);
    }
    setSheetUrl('');
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{mode === 'edit' ? 'Edit Member' : 'Add New Member'}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Buttons */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'manual'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('manual')}
            >
              Manually Enter
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === 'sheet'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('sheet')}
            >
              Google Sheet
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {activeTab === 'manual' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Name</label>
                  <input
                    type="text"
                    value={formData.nameMember}
                    onChange={(e) => setFormData({...formData, nameMember: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Jersey Number (1-99)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.number}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= 99) {
                        setFormData({...formData, number: e.target.value});
                      } else if (e.target.value === '') {
                        setFormData({...formData, number: ''});
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter number 1-99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                  <div className="flex items-center space-x-4">
                    {previewImage && (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Upload Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCaptain"
                    checked={formData.isCaptain}
                    onChange={(e) => setFormData({...formData, isCaptain: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isCaptain" className="ml-2 block text-sm text-gray-900">
                    Is Team Captain
                  </label>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Sheet URL</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      required
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Sheet must have columns: Member Name, Jersey Number, Captain (true/false)
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={uploading}
                className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : (mode === 'edit' ? 'Save Changes' : 'Add Member')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;