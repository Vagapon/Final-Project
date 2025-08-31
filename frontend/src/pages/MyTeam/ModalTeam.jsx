import React, { useState, useEffect } from "react";
import { X, Upload, Camera, User, Phone, Mail, Crown } from "lucide-react";

const ModalTeam = ({ isOpen, onClose, team, onUpdated }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Prefill khi edit
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        shortName: team.shortName || "",
        description: team.description || "",
        avatar: null,
      });
      setAvatarPreview(team.avatar || null);
    }
  }, [team]);

  // Fetch user info (manager)
  useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        try {
          const token = window.localStorage.getItem("token");
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: null });
    setAvatarPreview(null);
    const fileInput = document.getElementById("avatar");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = window.localStorage.getItem("token");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("shortName", formData.shortName);
      data.append("description", formData.description);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const url = team
        ? `http://localhost:5000/api/team/${team._id}`
        : "http://localhost:5000/api/team";
      const method = team ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (response.ok) {
        const teamData = await response.json();
        setMessage(`✅ ${team ? "Update" : "Create"} team success!`);

        if (onUpdated) onUpdated(teamData); // update UI
        onClose();
      } else {
        throw new Error("API Error");
      }
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.message || "Có lỗi xảy ra"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 relative text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {team ? "Edit Team" : "Create New Team"}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-5 gap-6 p-6">
            {/* LEFT - Manager info */}
                    <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Top background section */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-24 relative">
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Manager Avatar"
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                        <User size={28} className="text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                {user ? (
                  <>
                    <div className="pt-12 pb-4 px-4 text-center">
                      <div className="inline-flex items-center px-2.5 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full mb-2">
                        <Crown size={11} className="mr-1" />
                        Manager
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 text-xs">Team Creator</p>
                    </div>

                    {/* Contact Info */}
                    <div className="px-4 pb-6 space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Mail size={14} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-medium text-gray-500 uppercase">
                            Email
                          </p>
                          <p className="text-gray-900 text-sm font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Phone size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-medium text-gray-500 uppercase">
                            Phone
                          </p>
                          <p className="text-gray-900 text-sm font-medium">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Loading...
                  </p>
                )}
              </div>

              {/* About Section */}
            </div>

            {/* RIGHT - Team Form */}
            <div className="lg:col-span-3">
              <div className="max-w-xl mx-auto">
                <div className="mb-6 text-center">
                  <div className="relative inline-block mb-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Team Logo"
                        className="w-28 h-28 rounded-xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                        <Camera size={28} className="text-gray-400" />
                      </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-md">
                      <Upload size={14} className="text-white" />
                      <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="text-xs text-red-500 hover:underline block mx-auto"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {/* Inputs */}
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Team Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none"
                        placeholder="Enter team name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Short Name
                      </label>
                      <input
                        type="text"
                        name="shortName"
                        value={formData.shortName}
                        onChange={handleChange}
                        maxLength="3"
                        className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none text-center"
                        placeholder="ABC"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Team Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-0 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none resize-none text-sm"
                      placeholder="Tell us about your team..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg"
          >
            {loading ? "Saving..." : team ? "Update Team" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTeam;
