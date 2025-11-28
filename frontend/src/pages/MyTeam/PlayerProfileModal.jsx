import React from "react";
import { X, Shield, User2, Star, Globe, Instagram, Facebook, BadgeCheck } from "lucide-react";

const PlayerProfileModal = ({ isOpen, onClose, player }) => {
  if (!isOpen || !player) return null;

  const {
    name = "",
    avatar = "",
    number = "",
    position = "",
    role = "",
    description = "Adipiscing elit, sed do eiusmod tempor incididunt labore dolore magna aliqua.",
  } = player;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-[71] bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-white shadow hover:bg-gray-50"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Large portrait */}
          <div className="relative h-72 md:h-full bg-gray-100">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User2 className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{name}</h2>
            <div className="mt-2 text-gray-500 font-medium">{role || position || "Team Member"}</div>

            <p className="mt-6 text-gray-600 leading-relaxed">{description}</p>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-700">
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                Jersey #: <span className="font-semibold">{number || "-"}</span>
              </span>
              {position && (
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-gray-500" />
                  Position: <span className="font-semibold">{position}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Core Member
              </span>
            </div>

            {/* Social */}
            <div className="mt-8 flex items-center gap-4">
              {[{Icon: Facebook, label: "Facebook"}, {Icon: Globe, label: "Website"}, {Icon: Instagram, label: "Instagram"}].map(({Icon, label}, idx) => (
                <button key={label} className="w-12 h-12 rounded-full border flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileModal;


