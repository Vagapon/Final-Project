import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight } from 'lucide-react';
import SeasonCard from './SeasonCard';
import SeasonModal from '../../ModalEvent/SeasonModal';
import ConfirmDeleteModal from '../../ModalEvent/ConfirmDeleteModal';
import { message, Spin } from 'antd';
import seasonApi from '../../../api/seasonManagement/seasonApi';

const Season = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'view'
    season: null
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

const fetchSeasons = async () => {
  setLoading(true);
  try {
    const response = await seasonApi.getAllSeasons();
    setSeasons(response.data?.data || []);
    setError(null);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch seasons';
    setError(errorMessage);
    message.error(errorMessage);
  }
  setLoading(false);
};

  // Filter seasons based on search term
  const filteredSeasons = seasons.filter(season =>
    season.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    season.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    season: null
  });

  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      season: null
    });
  };

  const handleEdit = (season) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      season
    });
  };

  const handleView = (season) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      season
    });
  };

  const handleDelete = (season) => {
    setDeleteModal({
      isOpen: true,
      season
    });
  };

  const confirmDelete = async () => {
    try {
      await seasonApi.deleteSeason(deleteModal.season._id);
      setSeasons(prev => prev.filter(s => s._id !== deleteModal.season._id));
      setDeleteModal({ isOpen: false, season: null });
      message.success('Xóa season thành công!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa season';
      message.error(errorMessage);
    }
  };

  const handleSave = (seasonData) => {
    // SeasonModal đã gọi API và trả về data
    // Chỉ cần cập nhật state local
    if (modalState.mode === 'create') {
      setSeasons(prev => [...prev, seasonData]);
    } else if (modalState.mode === 'edit') {
      setSeasons(prev => prev.map(s => s._id === seasonData._id ? seasonData : s));
    }
    setModalState({ isOpen: false, mode: 'create', season: null });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', season: null });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, season: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
     <div className="flex items-center space-x-4 mb-4 ">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Manager</h1>
            <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              {/* <span>Home</span> */}
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Season Management</span>
            </nav>
          </div>

        {/* Search and Create Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100 dark:bg-gray-900 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white" size={20} />
              <input
                type="text"
                placeholder="Search seasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
              />
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
              <span>Create New Season</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 dark:bg-gray-900">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-white">Total Seasons</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{seasons.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-white">Currently Displayed</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-white">{filteredSeasons.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 dark:text-white">Active Seasons</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-white">{seasons.filter(s => new Date(s.endDate) > new Date()).length}</p>
          </div>
        </div>

        {/* Season Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeasons.map((season) => (
            <SeasonCard
              key={season._id}
              season={season}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSeasons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No seasons found' : 'No seasons yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try searching with different keywords' : 'Start by creating your first season'}
            </p>
         
          </div>
        )}

        {/* Modals */}
        <SeasonModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          season={modalState.season}
          onSave={handleSave}
          mode={modalState.mode}
        />

        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          seasonName={deleteModal.season?.name}
        />
      </div>
    </div>
  );
};

export default Season;